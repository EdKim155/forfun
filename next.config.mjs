import createNextIntlPlugin from 'next-intl/plugin';

const withIntl = createNextIntlPlugin('./src/i18n/routing.ts');

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    typedRoutes: true
  }
};

export default withIntl(nextConfig);
