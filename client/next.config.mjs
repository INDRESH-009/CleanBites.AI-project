/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            { source: "/auth/signup/details.js", destination: "/app/auth/signup/details.js" }
        ];
    },
};

export default nextConfig;
