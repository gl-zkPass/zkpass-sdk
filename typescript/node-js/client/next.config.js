/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
    serverComponentsExternalPackages: ["@didpass/zkpass-client-ts"],
  },
};

module.exports = nextConfig;
