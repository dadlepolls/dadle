/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    if (process.env.NODE_ENV == "development") {
      return [
        { source: "/graphql", destination: "http://localhost:3001/graphql" },
      ];
    } else {
      return [];
    }
  },
};
