/** @type {import('next').NextConfig} */

require("dotenv").config();

const apiUrl = process.env.API_URL || "http://localhost:3001";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      { source: "/healthz", destination: `${apiUrl}/healthz` },
    ];
  },
};
module.exports = nextConfig;
