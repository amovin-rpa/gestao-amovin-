/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Servir arquivos HTML da pasta v2-segura/public
  async rewrites() {
    return [
      {
        source: '/:path*.html',
        destination: '/v2-segura/public/:path*',
      },
      {
        source: '/:path*.js',
        destination: '/v2-segura/public/:path*',
      },
      {
        source: '/:path*.css',
        destination: '/v2-segura/public/:path*',
      },
      {
        source: '/images/:path*',
        destination: '/v2-segura/public/images/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
