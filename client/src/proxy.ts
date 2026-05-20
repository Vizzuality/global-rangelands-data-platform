import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_LOCALE, DISABLED_LOCALES, routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const DISABLED_LOCALE_PATTERN = new RegExp(`^/(${DISABLED_LOCALES.join("|")})(/|$)`);

export default function proxy(request: NextRequest) {
  const disabledMatch = request.nextUrl.pathname.match(DISABLED_LOCALE_PATTERN);
  if (disabledMatch) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = request.nextUrl.pathname.replace(
      DISABLED_LOCALE_PATTERN,
      `/${DEFAULT_LOCALE}$2`,
    );
    return NextResponse.redirect(redirectUrl);
  }

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
