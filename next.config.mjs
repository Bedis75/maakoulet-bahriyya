/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Les photos du client pourront être hébergées ailleurs (Cloudinary, S3…).
    // Ajouter ici le domaine correspondant le moment venu.
    remotePatterns: [],
  },
};

export default nextConfig;
