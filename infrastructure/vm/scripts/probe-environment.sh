#!/usr/bin/env bash
# Captures an observable fingerprint of a deployed environment.
#
# Two uses:
#   1. Baseline a deployment before a risky change, re-run after, diff.
#   2. Compare staging against the VM stack (GRASS-384) for parity.
#
#   BASE=https://staging.rangelandsdata.org ./probe-environment.sh out/staging
#
# Writes <prefix>.stable.txt (diff this) and <prefix>.volatile.txt (build
# fingerprints and timings -- expected to change, read it to confirm a deploy
# actually happened).
set -uo pipefail

BASE="${BASE:-https://staging.rangelandsdata.org}"
PREFIX="${1:-baseline}"
CURL_OPTS=(-sg --max-time 60 --retry 2 --retry-delay 2)
# Self-signed certs on the VM stack; staging is a real cert either way.
[ "${INSECURE:-0}" = "1" ] && CURL_OPTS+=(-k)

STABLE="${PREFIX}.stable.txt"
VOLATILE="${PREFIX}.volatile.txt"
mkdir -p "$(dirname "$STABLE")" 2>/dev/null || true
: > "$STABLE"; : > "$VOLATILE"
s() { printf '%s\n' "$*" >> "$STABLE"; }
v() { printf '%s\n' "$*" >> "$VOLATILE"; }

# LABEL records which deployment produced this capture. Nothing in the app
# exposes its own commit, so without it a baseline file is unidentifiable
# a week later.
s "# environment probe -- stable section"
s "# base=${BASE}"
s "# label=${LABEL:-<unset>}"
s ""
v "# environment probe -- volatile section (expected to differ between builds)"
v "# base=${BASE}  label=${LABEL:-<unset>}  captured=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
v ""

# --- 1. routes -------------------------------------------------------------
# Status plus the redirect target, which is where locale and canonical-host
# behaviour shows up. Not following redirects: the hop itself is the assertion.
s "## routes"
STORY_SLUG="adapting-to-climate-change-in-the-italian-alps"
DOC_STORY="rancho-el-ojo-mexico"
for path in \
  "/" "/en" "/es" "/fr" \
  "/en/map" "/en/map/stories" "/en/map/story/${STORY_SLUG}" \
  "/en/stories/rangelands-stories" \
  "/en/stories/restoration-champions" \
  "/en/stories/restoration-investments" \
  "/api/stories/${DOC_STORY}/document" \
  "/api/stories/${STORY_SLUG}/document" \
  "/api/stories/no-such-story-xyz/document" \
  "/en/definitely-not-a-page" \
  "/cms/admin" "/cms/_health" "/robots.txt" "/sitemap.xml"
do
  read -r code redir ctype < <(curl "${CURL_OPTS[@]}" -o /dev/null \
    -w '%{http_code} %{redirect_url} %{content_type}\n' "${BASE}${path}")
  # Strip the base so staging and the VM produce comparable redirect values.
  redir="${redir/#$BASE/<base>}"
  s "route ${path} -> ${code} ${redir:-"-"} ${ctype%%;*}"
done
s ""

# --- 2. public/ assets -----------------------------------------------------
# These are plain files copied into the image. Under output:"standalone" they
# are NOT included automatically -- the Dockerfile must copy public/ by hand,
# so a missing COPY shows up here and nowhere else.
s "## public assets (sha256 of body)"
for path in \
  "/favicon.ico" \
  "/images/metadata/site.webmanifest" \
  "/images/metadata/favicon-32x32.png" \
  "/images/home/home-center.png" \
  "/images/logo-footer.png" \
  "/images/header-pattern.png" \
  "/images/stories-pattern-tile.svg" \
  "/data/rangeland-systems.json" \
  "/data/rangeland-biomes.json" \
  "/data/rangeland-ecoregions.json"
do
  body="$(mktemp)"
  code="$(curl "${CURL_OPTS[@]}" -o "$body" -w '%{http_code}' "${BASE}${path}")"
  if [ "$code" = "200" ]; then
    s "asset ${path} -> 200 $(wc -c < "$body") $(sha256sum < "$body" | cut -c1-16)"
  else
    s "asset ${path} -> ${code} - -"
  fi
  rm -f "$body"
done
s ""

# --- 3. next/font files ----------------------------------------------------
# Served from .next/static, which standalone also requires an explicit COPY
# for. The URLs carry a build hash so they belong in the volatile section, but
# the file CONTENTS are the same font binaries across builds -- so the sorted
# hash set is stable and is the real assertion.
s "## fonts (sorted content hashes; urls are build-scoped, see volatile)"
font_urls="$(curl "${CURL_OPTS[@]}" -D - -o /dev/null "${BASE}/en" \
  | tr -d '\r' | grep -i '^link:' \
  | grep -o '/_next/static/media/[^>]*' | sort -u)"
s "font count ${BASE:+}$(printf '%s' "$font_urls" | grep -c . || true)"
{
  while IFS= read -r u; do
    [ -n "$u" ] || continue
    body="$(mktemp)"
    code="$(curl "${CURL_OPTS[@]}" -o "$body" -w '%{http_code}' "${BASE}${u}")"
    [ "$code" = "200" ] \
      && printf 'font %s %s\n' "$(wc -c < "$body")" "$(sha256sum < "$body" | cut -c1-16)" \
      || printf 'font MISSING %s\n' "$code"
    rm -f "$body"
  done <<< "$font_urls"
} | sort >> "$STABLE"
v "## font urls (build-scoped)"
printf '%s\n' "$font_urls" | sed 's/^/font-url /' >> "$VOLATILE"
v ""
s ""

# --- 4. the image optimizer ------------------------------------------------
# The sharpest canary for output:"standalone": sharp's native binaries are a
# classic tracing casualty, and the symptom is /_next/image failing while every
# HTML route still looks healthy. Byte counts are deterministic for a given
# sharp version + source + params, so they catch a silent fallback too.
s "## image optimizer (Accept pinned to webp so the format cannot drift)"
for spec in \
  "%2Fimages%2Fhome%2Fhome-center.png 828 75" \
  "%2Fimages%2Fhome%2Fhome-center.png 1920 75" \
  "%2Fimages%2Flogo-footer.png 256 75" \
  "%2Fimages%2Fheader-pattern.png 640 75"
do
  set -- $spec
  u="/_next/image?url=$1&w=$2&q=$3"
  read -r code ctype size < <(curl "${CURL_OPTS[@]}" -o /dev/null \
    -H 'Accept: image/webp,*/*' \
    -w '%{http_code} %{content_type} %{size_download}\n' "${BASE}${u}")
  s "image w=$2 q=$3 $1 -> ${code} ${ctype} ${size}"
done
s ""

# --- 4b. CMS images --------------------------------------------------------
# Asserted: every image the CMS advertises -- the original and each variant in
# `formats` -- is fetchable over the same path a browser uses, and really is an
# image. That is the user-visible outcome and it holds in every deployment.
#
# Observed, not asserted: whether pages route CMS media through the Next
# optimizer. They must not, see README "CMS images bypass next/image" -- the
# optimizer lists public/ when the server starts, so uploads landing on the
# volume later answer 400 until the container restarts. This is a count rather
# than a check because staging still runs the older build, where CMS media did
# go through the optimizer from GCS. A difference here is the migration
# landing, not a fault.
s "## CMS images"
mapfile -t media_urls < <(curl "${CURL_OPTS[@]}" \
  "${BASE}/cms/api/stories?populate=image&pagination[pageSize]=10" \
  | python3 -c '
import json,sys
try: d=json.load(sys.stdin)
except Exception: sys.exit()
out=[]
for i in d.get("data",[])[:5]:
    img=i.get("image") or {}
    if not img.get("url"): continue
    # The original plus every variant: cmsImageSrc may return any of them,
    # and Strapi skips presets larger than the source, so coverage varies.
    for u in [img["url"]] + [f.get("url") for f in (img.get("formats") or {}).values() if isinstance(f,dict)]:
        if u and u not in out: out.append(u)
for u in out: print(u)')

if [ "${#media_urls[@]}" -eq 0 ]; then
  s "cms-image NO-MEDIA-FOUND"
else
  probed=0; ok=0; first_fail=""
  for media_url in "${media_urls[@]}"; do
    # Same resolution the client does: absolute urls stand, relative ones get
    # the CMS prefix (lib/cms.ts mediaUrl).
    case "$media_url" in
      http://*|https://*) img_src="$media_url" ;;
      *)                  img_src="${BASE}/cms${media_url}" ;;
    esac
    probed=$((probed + 1))
    read -r code ctype < <(curl "${CURL_OPTS[@]}" -o /dev/null \
      -w '%{http_code} %{content_type}\n' "$img_src")
    v "cms-image ${media_url} -> ${code} ${ctype}"
    case "${code}:${ctype}" in
      200:image/*) ok=$((ok + 1)) ;;
      *) [ -z "$first_fail" ] && first_fail="${media_url} -> ${code} ${ctype}" ;;
    esac
  done
  s "cms-image probed=${probed} ok=${ok} failed=$((probed - ok))"
  [ "$ok" -eq "$probed" ] || \
    s "cms-image FAIL: $((probed - ok))/${probed} CMS images not served (${first_fail})"
fi

# Count of optimizer requests that carry CMS media rather than a bundled asset.
# Expected to be 0 on the VM stack and non-zero on the pre-migration build.
opt_media=0
for path in "/en" "/en/stories/atlas-stories" "/en/stories/restoration-investments"; do
  n="$(curl "${CURL_OPTS[@]}" "${BASE}${path}" \
    | grep -oE '_next/image\?url=[^"&\\]*' \
    | python3 -c '
import sys,urllib.parse
print(sum(1 for l in sys.stdin
          if "/uploads/" in urllib.parse.unquote(l) or "googleapis" in urllib.parse.unquote(l)))' )"
  opt_media=$((opt_media + ${n:-0}))
done
s "cms-image via-optimizer=${opt_media} (expected 0 after the media change)"
s ""

# --- 5. CMS content -------------------------------------------------------
# Published counts via the REST API. Raw table counts are 2x these under Strapi
# 5 draft & publish (draft + published rows share a document_id), so the API is
# the only number worth comparing.
s "## cms published counts"
for e in dataset-categories datasets ecoregions layers rangelands stories story-categories; do
  total="$(curl "${CURL_OPTS[@]}" "${BASE}/cms/api/${e}?pagination[pageSize]=1" \
    | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin); p=d.get("meta",{}).get("pagination")
    print(p["total"] if p else "ERR-"+str(d.get("error",{}).get("status","?")))
except Exception: print("ERR-parse")' 2>/dev/null)"
  s "count ${e} ${total}"
done
s ""

# --- 6. media provider ----------------------------------------------------
# Where the CMS believes its files live. On staging this is GCS; after the
# migration it must be relative /uploads paths served by nginx.
s "## media url hosts (files the CMS reports)"
curl "${CURL_OPTS[@]}" "${BASE}/cms/api/stories?populate=document&pagination[pageSize]=100&fields[0]=slug" \
  | python3 -c '
import json,sys,collections,urllib.parse as up
try: d=json.load(sys.stdin)
except Exception: print("media ERR-parse"); sys.exit()
hosts=collections.Counter()
for i in d.get("data",[]):
    doc=i.get("document")
    if not doc: continue
    u=doc.get("url","")
    hosts[up.urlparse(u).netloc or "<relative>"]+=1
print("media documents", sum(hosts.values()))
for h,n in sorted(hosts.items()): print("media host",h,n)' >> "$STABLE"
s ""

# --- 7. rendered html structure -------------------------------------------
# Not a body hash -- HTML carries per-build chunk names. These are the counts
# and markers that must survive a rebuild unchanged.
s "## rendered html structure"
# Detail and per-category pages carry the media references, so they are where
# a provider or URL-rewrite regression shows up -- the index pages alone miss it.
for path in "/en" "/en/map" "/en/stories/rangelands-stories" \
            "/en/stories/restoration-champions" "/en/stories/restoration-investments" \
            "/en/map/story/${STORY_SLUG}"; do
  html="$(mktemp)"
  curl "${CURL_OPTS[@]}" -o "$html" "${BASE}${path}"
  python3 - "$path" "$html" <<'PY' >> "$STABLE"
import re,sys
path,f=sys.argv[1],sys.argv[2]
h=open(f,encoding="utf-8",errors="replace").read()
title=re.search(r"<title[^>]*>([^<]*)</title>",h)
print(f"html {path} bytes~{len(h)//1000}k")
print(f"html {path} title={title.group(1) if title else '<none>'}")
print(f"html {path} next-image-refs={len(re.findall(r'/_next/image\?url=',h))}")
print(f"html {path} chunk-refs={len(set(re.findall(r'/_next/static/chunks/[^\"]+\.js',h)))}")
print(f"html {path} gcs-refs={len(re.findall(r'storage\.googleapis\.com',h))}")
print(f"html {path} h1={len(re.findall(r'<h1',h))} canvas={len(re.findall(r'<canvas',h))}")
# NOT a "next-error" grep: that class is inlined into the error boundary of
# every healthy page. These two actually discriminate -- the footer only
# renders when the whole tree rendered, and digest appears when a server
# component threw.
print(f"html {path} footer-rendered={'Data Rangelands, 2025' in h}")
print(f"html {path} server-error-digests={len(re.findall(chr(34)+'digest'+chr(34)+r':', h))}")
PY
  rm -f "$html"
done
s ""

# --- 8. stable response headers -------------------------------------------
s "## selected response headers"
for path in "/en" "/cms/api/layers" "/images/home/home-center.png"; do
  curl "${CURL_OPTS[@]}" -D - -o /dev/null "${BASE}${path}" | tr -d '\r' \
    | grep -iE '^(content-type|cache-control|x-powered-by|content-security-policy|x-frame-options|strict-transport-security|x-content-type-options):' \
    | sort | sed "s|^|header ${path} |" >> "$STABLE"
done
s ""

# --- volatile: build fingerprint + timings --------------------------------
v "## build fingerprint (changes on every deploy -- use it to prove one landed)"
curl "${CURL_OPTS[@]}" "${BASE}/en" \
  | grep -o '/_next/static/chunks/[^"]*\.js' | sort -u | sed 's/^/chunk /' >> "$VOLATILE"
v ""
v "## timings (informational)"
for path in "/en" "/en/map" "/cms/api/layers" "/_next/image?url=%2Fimages%2Fhome%2Fhome-center.png&w=828&q=75"; do
  t="$(curl "${CURL_OPTS[@]}" -o /dev/null -w '%{time_total}' "${BASE}${path}")"
  v "time ${path} ${t}s"
done

echo "wrote ${STABLE} and ${VOLATILE}"
