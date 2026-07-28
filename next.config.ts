import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel Blob's public CDN hostname — required so next/image can serve uploaded
    // media (cover images, galleries, logos) once uploads persist there in production.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
