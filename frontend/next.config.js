/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
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
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/backend/auth/login",
        permanent: true,
      },
    ];
  },
};
