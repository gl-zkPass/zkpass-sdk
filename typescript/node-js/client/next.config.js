/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
    serverComponentsExternalPackages: ["@didpass/zkpass-client-ts"],
  },

  // webpack: (
  //   config,
  //   { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  // ) => {
  //   return {
  //     ...config,
  //     node: {
  //       ...config.node,
  //       __dirname: true,
  //     },
  //   };
  // },
};

module.exports = nextConfig;
