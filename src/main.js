// ============================================================
// 通用主入口 —— 初始化布局、FAQ 折叠、滚动渐显动效
// ============================================================
import './styles/design-system.css'
import './styles/components.css'
import './styles/demos.css'
import { initLayout } from './layout.js'

initLayout()

// FAQ 折叠
document.querySelectorAll('[data-faq]').forEach((item) => {
  const q = item.querySelector('.faq-q')
  if (!q) return
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open')
    // 关闭其他
    document.querySelectorAll('[data-faq].open').forEach((o) => o.classList.remove('open'))
    if (!isOpen) item.classList.add('open')
  })
})

// 滚动渐显动效：自动给关键区块标记 .reveal，进入视口时添加 .in-view
// 尊重 prefers-reduced-motion（用户开启减少动效时直接显示）
export function initReveal() {
  // 自动标记需要渐显的元素（section-header、网格子项、卡片等）
  const autoSelectors = [
    '.section-header',
    '.grid > *',
    '.hero-proof',
    '.timeline-item',
    '.split-item',
    '.detail-block',
    '.demo-section',
  ]
  const seen = new Set()
  autoSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return
      seen.add(el)
      el.classList.add('reveal')
    })
  })

  const els = document.querySelectorAll('.reveal')
  if (!els.length) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in-view'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  )
  els.forEach((el) => io.observe(el))
}
initReveal()

// 页脚年份已由 layout 处理
