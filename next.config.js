// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   optimizeFonts: false,
//   swcMinify: false,

//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*",
//         destination: "http://157.20.214.84:9292/api/:path*",
        
//       },
//     ];
//   },

//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  swcMinify: false,

  async rewrites() {
    return [
      // Tenant → 9291
      {
        source: "/api/:path*",
        has: [
          {
            type: "header",
            key: "X-Tenant",
            value: "670a48b168b0640a262870c4",
          },
        ],
        destination: "http://157.20.214.84:9291/api/:path*",
      },

      // Tenant → 9292
      {
        source: "/api/:path*",
        has: [
          {
            type: "header",
            key: "X-Tenant",
            value: "68b20dd0fb42964f2328b424",
          },
        ],
        destination: "http://157.20.214.84:9292/api/:path*",
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
