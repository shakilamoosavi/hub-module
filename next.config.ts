
const withNextIntl = require('next-intl/plugin')('./next-intl.config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add your Next.js config options here
};

module.exports = withNextIntl(nextConfig);
