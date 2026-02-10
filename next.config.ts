import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eauhktvhamubsfpewmoa.supabase.co",
        pathname: "/storage/v1/object/public/club-images/**",
      },
    ],
  },
};

export default nextConfig;
