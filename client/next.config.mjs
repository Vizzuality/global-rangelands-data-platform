import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/rdp-landing-bucket/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/rdp-staging-media/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/rdp-prod-media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "0.0.0.0",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "staging.rangelandsdata.org",
        pathname: "/cms/uploads/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "removeViewBox",
                    active: false,
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/:locale(en|es|fr)/stories/rangelands-stories/:path*",
        destination: "/:locale/features/rangelands-features/:path*",
        permanent: true,
      },
      {
        source: "/:locale(en|es|fr)/stories/rangelands-stories",
        destination: "/:locale/features/rangelands-features",
        permanent: true,
      },
      {
        source: "/:locale(en|es|fr)/stories/:path*",
        destination: "/:locale/features/:path*",
        permanent: true,
      },
      {
        source: "/:locale(en|es|fr)/map/story/:slug",
        destination: "/:locale/map/feature/:slug",
        permanent: true,
      },
      {
        source: "/:locale(en|es|fr)/map/stories",
        destination: "/:locale/map/features",
        permanent: true,
      },
      {
        source: "/stories/rangelands-stories/:path*",
        destination: "/en/features/rangelands-features/:path*",
        permanent: true,
      },
      {
        source: "/stories/rangelands-stories",
        destination: "/en/features/rangelands-features",
        permanent: true,
      },
      {
        source: "/stories/:path*",
        destination: "/en/features/:path*",
        permanent: true,
      },
      {
        source: "/map/story/:slug",
        destination: "/en/map/feature/:slug",
        permanent: true,
      },
      {
        source: "/map/stories",
        destination: "/en/map/features",
        permanent: true,
      },
      {
        source: "/api/stories/:slug/document",
        destination: "/api/features/:slug/document",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
