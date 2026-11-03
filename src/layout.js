// ============================================================
// 共享布局：渲染顶部导航 + 移动菜单 + 页脚
// 每个页面调用 initLayout()，传入当前激活的导航项
// ============================================================
import { siteConfig } from './data/site.js'

// 获取当前路径，用于标记激活导航
function currentPath() {
  return window.location.pathname
}

// 计算「站点根目录」的前缀：根页面用 ./，一级子目录页面用 ../
// 依据当前 URL 中是否出现已知子目录名来判断层级，兼容根域名、子路径部署、file:// 等场景
// 新增页面目录时，请同步维护 SUB_DIRS 列表
const SUB_DIRS = ['demos', 'solutions', 'projects', 'process', 'about', 'contact', 'privacy']

function siteBase() {
  const segs = currentPath().split('/').filter(Boolean)
  const inSubDir = segs.some((s) => SUB_DIRS.includes(s.replace(/\.html$/i, '')))
  return inSubDir ? '../' : './'
}

function navHtml() {
  const base = siteBase()
  return siteConfig.nav
    .map((item) => {
      const isActive = currentPath().indexOf(item.href.replace(/\/$/, '')) >= 0
      return `<li><a class="${isActive ? 'active' : ''}" href="${base}${item.href}">${item.label}</a></li>`
    })
    .join('')
}

export function initLayout() {
  const base = siteBase()
  const header = document.querySelector('[data-header]')
  if (header) {
    header.innerHTML = `
      <div class="container">
        <a class="brand" href="${base}">
          <span class="brand-logo">AI</span>
          <span>${siteConfig.brandName}</span>
        </a>
        <nav aria-label="主导航">
          <ul class="nav-list">${navHtml()}</ul>
        </nav>
        <a class="btn btn-primary header-cta" href="${base}${siteConfig.cta.href}">${siteConfig.cta.label}</a>
        <button class="nav-toggle" type="button" aria-label="打开菜单" aria-expanded="false" data-nav-toggle>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
      <div class="mobile-menu" data-mobile-menu>
        ${siteConfig.nav
          .map((i) => `<a href="${base}${i.href}">${i.label}</a>`)
          .join('')}
        <a class="btn btn-primary btn-block mobile-cta" href="${base}${siteConfig.cta.href}">${siteConfig.cta.label}</a>
      </div>
    `
  }

  const footer = document.querySelector('[data-footer]')
  if (footer) {
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="brand" style="color:#fff">
              <span class="brand-logo">AI</span>
              <span>${siteConfig.brandName}</span>
            </div>
            <p>${siteConfig.tagline}。${siteConfig.subtitle}</p>
          </div>
          <div class="footer-col">
            <h4>产品与方案</h4>
            <ul>
              <li><a href="${base}solutions/">产品与解决方案</a></li>
              <li><a href="${base}demos/">产品演示中心</a></li>
              <li><a href="${base}process/">合作流程</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>了解我们</h4>
            <ul>
              <li><a href="${base}projects/">项目实践</a></li>
              <li><a href="${base}about/">关于与能力边界</a></li>
              <li><a href="${base}contact/">联系我们</a></li>
              <li><a href="${base}privacy/">隐私说明</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${siteConfig.brandName} · 网站演示与产品说明</span>
          <span>本网站所展示的模拟案例均为演示数据，不代表真实客户业务。</span>
        </div>
      </div>
    `
  }

  // 移动菜单开关
  const toggle = document.querySelector('[data-nav-toggle]')
  const mobileMenu = document.querySelector('[data-mobile-menu]')
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open')
      toggle.setAttribute('aria-expanded', String(open))
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单')
    })
    // 点击菜单项后关闭
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open')
        toggle.setAttribute('aria-expanded', 'false')
      })
    })
  }
}
