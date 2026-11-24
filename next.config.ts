import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La app es casi toda de cliente (progreso en el dispositivo); el contenido se lee de archivos locales.
  cacheComponents: false,
};

export default nextConfig;
