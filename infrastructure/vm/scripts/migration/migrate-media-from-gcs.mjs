#!/usr/bin/env node
/**
 * [migration] GRASS-384 one-shot, dead after cutover.
 * Launched by migrate-media-from-gcs.sh.
 *
 * Copies the staging media objects out of GCS into the Strapi upload volume.
 *
 * Runs inside a container with the volume mounted at /media, so it needs
 * nothing installed on the host and behaves the same against a remote Docker
 * context. Launch it with migrate-media-from-gcs.sh.
 *
 * The bucket is public (publicFiles: true in cms/config/plugins.ts), so this
 * needs no credentials.
 *
 * Objects are stored one folder per file, <hash><ext>/<hash><ext>. The local
 * provider rebuilds paths as uploadPath/<hash><ext> on delete and replace
 * (@strapi/provider-upload-local/dist/index.js:96,123,148) and ignores the
 * stored url, so files MUST land flat. Preserving the folders would serve
 * reads correctly and silently break deletion.
 */

import { readdir, stat, writeFile, chown, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";

const BUCKET = process.env.BUCKET ?? "rdp-staging-media";
// Not /media: that path exists in the base image (cdrom, floppy, usb), and
// Docker pre-populates an empty named volume from the image, which would seed
// the upload volume with three stray directories.
const MEDIA_DIR = process.env.MEDIA_DIR ?? "/uploads";
// Strapi runs as uid 1001 in cms/Dockerfile.prod; files it cannot read are
// invisible to the CMS even though nginx would serve them.
const OWNER_UID = Number(process.env.OWNER_UID ?? 1001);
const OWNER_GID = Number(process.env.OWNER_GID ?? 1001);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);

const API = `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o`;

const fail = (msg) => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

/** Every object in the bucket, following the pagination cursor to the end. */
async function listBucket() {
  const objects = [];
  let pageToken;
  do {
    const url = new URL(API);
    url.searchParams.set("fields", "items(name,size),nextPageToken");
    url.searchParams.set("maxResults", "1000");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    if (!res.ok) fail(`listing ${BUCKET}: HTTP ${res.status}`);
    const page = await res.json();

    for (const item of page.items ?? []) {
      objects.push({ name: item.name, size: Number(item.size ?? 0) });
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  return objects;
}

/** Flattening is only safe if basenames are unique. Assert it, don't assume. */
function assertNoCollisions(objects) {
  const seen = new Map();
  const collisions = new Set();
  for (const o of objects) {
    const base = basename(o.name);
    if (seen.has(base)) collisions.add(base);
    seen.set(base, o.name);
  }
  if (collisions.size > 0) {
    console.error(`${objects.length} objects but ${seen.size} distinct basenames.`);
    console.error("Flattening would overwrite files. Resolve these first:");
    for (const c of [...collisions].sort()) console.error(`  ${c}`);
    fail(`${collisions.size} basename collision(s)`);
  }
  return seen.size;
}

/** Local size, or null when the file is absent. */
async function localSize(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return null;
  }
}

async function download(object) {
  const dest = join(MEDIA_DIR, basename(object.name));

  // Idempotent: a re-run only fetches what is missing or the wrong size.
  if ((await localSize(dest)) === object.size) return "skipped";

  // Encode each path segment but keep the separators: object names are
  // user-supplied filenames and may contain spaces or reserved characters.
  const encoded = object.name.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`https://storage.googleapis.com/${BUCKET}/${encoded}`);
  if (!res.ok) fail(`downloading ${object.name}: HTTP ${res.status}`);

  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return "downloaded";
}

/** Runs tasks with a bounded number in flight. */
async function pool(items, limit, worker) {
  const results = [];
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  await mkdir(MEDIA_DIR, { recursive: true });

  console.log(`==> listing gs://${BUCKET}`);
  const objects = await listBucket();
  if (objects.length === 0) fail("bucket listing returned no objects");
  console.log(`    ${objects.length} objects`);

  const distinct = assertNoCollisions(objects);
  console.log(`    ${distinct} distinct basenames, no collisions`);

  console.log(`==> downloading into ${MEDIA_DIR} (flattened)`);
  const outcomes = await pool(objects, CONCURRENCY, download);
  const downloaded = outcomes.filter((o) => o === "downloaded").length;
  console.log(`    downloaded ${downloaded}, already present ${outcomes.length - downloaded}`);

  console.log("==> verifying sizes against the bucket listing");
  const bad = [];
  for (const o of objects) {
    const dest = join(MEDIA_DIR, basename(o.name));
    const size = await localSize(dest);
    if (size === null) bad.push(`MISSING: ${dest}`);
    else if (size !== o.size) bad.push(`SIZE MISMATCH: ${dest} is ${size}, bucket says ${o.size}`);
  }
  if (bad.length > 0) {
    for (const b of bad) console.error(b);
    fail(`${bad.length} object(s) did not verify`);
  }
  console.log(`    all ${objects.length} objects match the bucket byte counts`);

  console.log(`==> chown to ${OWNER_UID}:${OWNER_GID}`);
  for (const name of await readdir(MEDIA_DIR)) {
    await chown(join(MEDIA_DIR, name), OWNER_UID, OWNER_GID);
  }

  const total = (await readdir(MEDIA_DIR)).length;
  console.log(`==> done, ${total} files in ${MEDIA_DIR}`);
}

await main();
