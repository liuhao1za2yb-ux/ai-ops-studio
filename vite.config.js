import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// 多页应用：每个页面都是独立 HTML 入口，保证静态托管下直接访问与刷新不 404
const pages = {
  main: resolve(__dirname, 'index.html'),
  solutions: resolve(__dirname, 'solutions/index.html'),
  demos: resolve(__dirname, 'demos/index.html'),
  projects: resolve(__dirname, 'projects/index.html'),
  process: resolve(__dirname, 'process/index.html'),
  about: resolve(__dirname, 'about/index.html'),
  contact: resolve(__dirname, 'contact/index.html'),
  privacy: resolve(__dirname, 'privacy/index.html'),
}

// 6 个产品详情页
const productSlugs = ['ai-customer-service', 'ai-lead-generation', 'geo-brand-visibility', 'data-automation', 'knowledge-base-qa', 'custom-automation']
productSlugs.forEach((slug) => {
  pages[`solution-${slug}`] = resolve(__dirname, `solutions/${slug}.html`)
})

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: pages,
    },
  },
})
