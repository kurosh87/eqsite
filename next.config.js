/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "7ku24g8oti06nmwx.public.blob.vercel-storage.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "humanphenotypes.net",
        port: "",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.vercel-storage.com https://*.public.blob.vercel-storage.com https://api.openai.com https://img.clerk.com https://humanphenotypes.net",
              "connect-src 'self' https://*.neon.tech https://api.openai.com https://api.anthropic.com https://api.replicate.com wss://*.neon.tech https://m.stripe.com https://r.stripe.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.externals.push("bun:sqlite");
    return config;
  },
};

module.exports = nextConfig;
