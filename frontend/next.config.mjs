/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // unoptimized: true, 

    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      
      {
        protocol: "https",
        hostname: "joglodhepis-production.up.railway.app",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;