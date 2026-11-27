/** @type {import('next').NextConfig} */
const nextConfig = {
    // Lets the dev server accept requests through ngrok tunnels (dev only).
    allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok-free.dev'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            },
        ],
    },
};

export default nextConfig;