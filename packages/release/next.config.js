/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 禁用 React Server Components 对 antd 的支持问题
    serverComponentsExternalPackages: ['antd'],
  },
  // 禁用静态导出时的 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 禁用 TypeScript 类型检查（如果存在类型错误）
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
