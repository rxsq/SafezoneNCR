/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
      { source: "/healthz", destination: "http://localhost:3001/healthz" },
    ];
  },
};
module.exports = nextConfig;
