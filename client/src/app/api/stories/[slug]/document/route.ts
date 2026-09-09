import { NextResponse } from "next/server";

import { cmsInternalApiBase, cmsInternalMediaBase, internalMediaUrl } from "@/lib/cms.server";

type StoriesDocumentResponse = {
  data?: { document?: { url?: string; name?: string; mime?: string } | null }[];
};

const isAllowedMediaUrl = (url: string) => {
  try {
    const { protocol, hostname } = new URL(url);
    // The CMS origin, plus GCS for content still pointing at the old buckets.
    const allowed = [new URL(cmsInternalMediaBase()).hostname, "storage.googleapis.com"];
    return /^https?:$/.test(protocol) && allowed.includes(hostname);
  } catch {
    return false;
  }
};

const getAttachmentFilename = (name: string | undefined) =>
  (name ?? "document").replace(/["\\\r\n]/g, "");

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate[0]": "document",
    "pagination[limit]": "1",
  });

  const storyResponse = await fetch(`${cmsInternalApiBase()}/stories?${query.toString()}`);

  if (!storyResponse.ok) {
    return new NextResponse(null, { status: 502 });
  }

  const { data }: StoriesDocumentResponse = await storyResponse.json();
  const document = data?.[0]?.document;

  if (!document?.url) {
    return new NextResponse(null, { status: 404 });
  }

  const documentUrl = internalMediaUrl(document.url);

  if (!isAllowedMediaUrl(documentUrl)) {
    return new NextResponse(null, { status: 502 });
  }

  const fileResponse = await fetch(documentUrl, { redirect: "manual" });

  if (!fileResponse.ok || !fileResponse.body) {
    return new NextResponse(null, { status: 502 });
  }

  return new NextResponse(fileResponse.body, {
    headers: {
      "Content-Type": document.mime ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${getAttachmentFilename(document.name)}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
