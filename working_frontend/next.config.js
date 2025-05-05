/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

module.exports = withMDX({
  ...baseConfig,
  pageExtensions: ['ts', 'tsx', 'mdx'],
});
