/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**", // Allows all paths under flagcdn.com
      },
      {
        protocol: "https",
        hostname: "flagsapi.com",
        pathname: "/**", // Allows all paths under flagcdn.com
      },
      {
        protocol: "https",
        hostname: "static2.finnhub.io",
        pathname: "/**", // Allows all paths under flagcdn.com
      },
    ],
    
  },
};

export default nextConfig;
