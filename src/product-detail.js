// ============================================================
// 产品详情页渲染 —— 统一模板
// ============================================================
import { getProductDetail } from './data/product-details.js'
import { icon } from './icons.js'
import { initChatDemo, initCsvDemo, initLeadsDemo, initKbDemo, initGeoDemo, initCustomDemo } from './demos/demo-controllers.js'
import { initReveal } from './main.js'

// 从 URL 或 body data 属性获取 slug
const slug = document.body.dataset.slug
const d = getProductDetail(slug)
if (!d) {
  document.getElementById('detail-root').innerHTML = '<p>未找到该产品。</p>'
} else {
  document.title = `${d.name} — 企业智能自动化工作室`

  const demoMap = {
    'ai-customer-service': 'chat',
    'ai-lead-generation': 'leads',
    'data-automation': 'csv',
    'knowledge-base-qa': 'kb',
    'geo-brand-visibility': 'geo',
    'custom-automation': 'custom',
  }

  const demoType = demoMap[slug]
  // 所有产品现在都有演示
  const demoHtml = demoType ? `<div id="inline-demo"></div>` : ''

  document.getElementById('detail-root').innerHTML = `
    <div class="detail-hero">
      <span class="badge badge-info"><span class="badge-dot"></span>产品与解决方案</span>
      <h1>${d.name}</h1>
      <p class="detail-sub">${d.valueProp}</p>
      <div class="hero-actions mt-6">
        ${demoType ? `<a class="btn btn-primary" href="../${d.demoRoute}">体验演示</a>` : ''}
        <a class="btn btn-secondary" href="../contact/">沟通业务需求</a>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="detail-grid">
          <div class="detail-main">
            <section class="detail-block">
              <h2>适用对象与业务痛点</h2>
              <p class="text-muted">${d.audience.join('、')}。</p>
              <ul class="check-list mt-4">
                ${d.painPoints.map((p) => `<li>${p}</li>`).join('')}
              </ul>
            </section>

            <section class="detail-block">
              <h2>典型工作流程</h2>
              <ol class="timeline">
                ${d.workflow.map((w, i) => `<li class="timeline-item"><span class="step-num">${i + 1}</span><h3>${w.step}</h3><p>${w.desc}</p></li>`).join('')}
              </ol>
            </section>

            <section class="detail-block">
              <h2>功能模块</h2>
              <div class="flex flex-wrap gap-2">
                ${d.features.map((f) => `<span class="industry-tag">${f}</span>`).join('')}
              </div>
            </section>

            <section class="detail-block">
              <h2>可交互演示</h2>
              ${demoHtml}
            </section>

            <section class="detail-block">
              <h2>数据来源与系统接入说明</h2>
              <div class="note note-info"><span class="note-icon">ℹ</span><span>${d.dataSource}</span></div>
            </section>

            <section class="detail-block">
              <h2>交付范围与限制</h2>
              <h4 class="mb-4">交付范围</h4>
              <ul class="check-list mb-4">
                ${d.delivery.map((x) => `<li>${x}</li>`).join('')}
              </ul>
              <h4 class="mb-4">限制说明</h4>
              <ul class="check-list">
                ${d.limitations.map((x) => `<li>${x}</li>`).join('')}
              </ul>
            </section>

            <section class="detail-block">
              <h2>合作步骤</h2>
              <ol class="timeline">
                ${d.steps.map((s, i) => `<li class="timeline-item"><span class="step-num">${i + 1}</span><h3>${s}</h3></li>`).join('')}
              </ol>
            </section>

            <section class="detail-block">
              <h2>常见问题</h2>
              ${d.faq.map((f, i) => `
                <div class="faq-item ${i === 0 ? 'open' : ''}" data-faq>
                  <button class="faq-q" type="button"><span>${f.q}</span><svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
                  <div class="faq-a">${f.a}</div>
                </div>
              `).join('')}
            </section>
          </div>

          <aside class="detail-side">
            <div class="card" style="position:sticky;top:90px">
              <h3 style="margin-bottom:var(--sp-3)">联系 CTA</h3>
              <p class="text-muted" style="font-size:var(--fs-sm);margin-bottom:var(--sp-4)">想了解「${d.name}」如何落地到你的业务？</p>
              <a class="btn btn-primary btn-block" href="../contact/">沟通业务需求</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `

  // 初始化对应演示
  if (demoType === 'chat') initChatDemo(document.getElementById('inline-demo'))
  else if (demoType === 'csv') initCsvDemo(document.getElementById('inline-demo'))
  else if (demoType === 'leads') initLeadsDemo(document.getElementById('inline-demo'))
  else if (demoType === 'kb') initKbDemo(document.getElementById('inline-demo'))
  else if (demoType === 'geo') initGeoDemo(document.getElementById('inline-demo'))
  else if (demoType === 'custom') initCustomDemo(document.getElementById('inline-demo'))

  // FAQ 折叠
  document.querySelectorAll('[data-faq]').forEach((item) => {
    const q = item.querySelector('.faq-q')
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open')
      document.querySelectorAll('[data-faq].open').forEach((o) => o.classList.remove('open'))
      if (!isOpen) item.classList.add('open')
    })
  })

  // 渲染完成后初始化滚动渐显动效
  initReveal()
}
