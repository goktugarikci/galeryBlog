import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001', // Backend sunucunuzun portu
        pathname: '/uploads/**', // Resimlerin bulunduğu klasör
      },
      // İleride canlı sunucuya (örn: api.sitem.com) geçtiğinizde onu da buraya eklemeniz gerekecek.
    ],
  },
};

export default nextConfig;