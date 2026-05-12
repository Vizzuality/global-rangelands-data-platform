import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const location = response.headers.get("location");
  if (!location) return response;

  const url = new URL(location);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    url.host = forwardedHost;
    if (!forwardedHost.includes(":")) url.port = "";
  }
  if (forwardedProto) url.protocol = `${forwardedProto}:`;
  response.headers.set("location", url.toString());
  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
