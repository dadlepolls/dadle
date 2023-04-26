const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV == "development") {
      return [
        {
          source: "/backend/:path*",
          destination: "http://localhost:3001/:path*",
        },
      ];
    } else {
      return [];
    }
  },
  publicRuntimeConfig: {
    backendPublicUrl: process.env.BACKEND_PUBLIC_URL,
  },
  i18n,
};
