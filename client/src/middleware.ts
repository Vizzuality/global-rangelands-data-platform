import createMiddleware from "next-intl/middleware";

export const DEFAULT_LOCALE = "en";
export const LOCALES = [DEFAULT_LOCALE, "es", "fr"];

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["en", "es", "fr"],

  // Used when no locale matches
  defaultLocale: "en",
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
