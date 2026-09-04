import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@hyperledger/fabric-gateway', '@grpc/grpc-js', 'pkcs11js'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
