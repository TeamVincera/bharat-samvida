/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['pdfkit', 'pdf-parse', 'mammoth'],
  outputFileTracingIncludes: { '/api/v1/exports': ['./public/fonts/*.ttf'], '/api/v1/documents/*/hindi': ['./data/document-text/*.json', './public/fonts/*.ttf'] },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }
  ]
};

export default nextConfig;
