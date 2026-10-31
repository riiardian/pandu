import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/xray",
        destination: "/investigasi",
        permanent: true,
      },
      {
        source: "/aksi",
        destination: "/lapor",
        permanent: true,
      },
      {
        source: "/laporan",
        destination: "/lapor",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
