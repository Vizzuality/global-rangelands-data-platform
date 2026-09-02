import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Traces only the files the server actually reaches, so the production image
  // ships ~150-250 MB instead of a full 1.3 GB node_modules. Requires the
  // runner to start via `node server.js` (see entrypoint.sh).
  output: "standalone",
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
};

export default withNextIntl(nextConfig);
