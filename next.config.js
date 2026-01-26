/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  swcMinify: false,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://157.20.214.84:9292/api/:path*",
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
