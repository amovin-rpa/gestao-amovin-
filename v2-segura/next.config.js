/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Para manter compatibilidade com arquivos HTML existentes
  rewrites: async () => {
    return [
      {
        source: '/:path*.html',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
