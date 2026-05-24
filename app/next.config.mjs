/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      // bun:sqlite is a Bun built-in; leave it external so webpack doesn't try to resolve.
      config.externals.push({ "bun:sqlite": "commonjs bun:sqlite" });
    }
    return config;
  },
};

export default nextConfig;
