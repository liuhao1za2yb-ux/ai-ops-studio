// ============================================================
// 演示模块控制器 —— 六个演示
// 1. AI 客服意图识别   2. CSV 数据清洗   3. 社媒评论截流
// 4. 知识库问答        5. GEO 服务展示   6. 定制自动化流程
// 全部本地规则驱动 / 展示型演示，不调用真实 AI API，不采集真实数据
// ============================================================
import { chatIntents, unknownReply, knowledgeBase, kbUnknownAnswer, leadComments } from './demo-data.js'
import { runCleaning, toCsv, normalizePhone } from './cleaning-engine.js'

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

// ---------- 1. AI 客服 ----------
// 归一化：统一全角标点为半角、去首尾空格、合并连续空格
function normalizeQuery(s) {
  return String(s || '')
    .replace(/[\u3000\u3001\u3002\uff01\uff1f\uff0c\uff1b\uff1a]/g, (c) =>
      ({ '\u3000': ' ', '\u3001': ',', '\u3002': '.', '\uff01': '!', '\uff1f': '?', '\uff0c': ',', '\uff1b': ';', '\uff1a': ':' }[c])
    )
    .replace(/\s+/g, ' ')
    .trim()
}

// 意图匹配：多关键词命中 + 权重打分，返回命中的意图与命中的关键词
function matchIntent(raw) {
  const q = normalizeQuery(raw)
  if (!q) return null
  let best = null
  let bestScore = 0
  let bestHits = []
  for (const intent of chatIntents) {
    const hits = intent.keywords.filter((k) => q.includes(k))
    if (!hits.length) continue
    // 得分 = 命中关键词数 + 权重；权重高的（投诉/退款等）优先
    const score = hits.length + (intent.weight || 1)
    if (score > bestScore) {
      bestScore = score
      best = intent
      bestHits = hits
    }
  }
  if (!best) return null
  return { intent: best, hits: bestHits, score: bestScore }
}

export function initChatDemo(root) {
  if (!root) return
  // 头像：客服用门店头像，用户用访客头像（内联 SVG，无外部依赖）
  const AVATAR_AGENT = `<span class="chat-avatar chat-avatar-agent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-5 8-5s8 1.7 8 5"/></svg></span>`
  const AVATAR_USER = `<span class="chat-avatar chat-avatar-user"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-5 8-5s8 1.7 8 5"/></svg></span>`

  root.innerHTML = `
    <div class="demo-widget">
      <div class="demo-widget-head">
        <h3>AI 客服意图识别演示</h3>
        <span class="badge badge-info"><span class="badge-dot"></span>意图识别</span>
      </div>
      <div class="demo-widget-body">
        <div class="chat-window" data-chat-window>
          <div class="msg"><div class="msg-row msg-out">${AVATAR_AGENT}<div class="msg-bubble">您好，欢迎咨询云帆美业！您可以试试问「你们几点下班」「怎么预约」「多少钱」「我要投诉」等。</div></div></div>
        </div>
        <form class="chat-form" data-chat-form>
          <input type="text" class="chat-input" placeholder="输入您的问题，例如：你们几点下班？我晚上才有空过去。" autocomplete="off" />
          <button type="submit" class="btn btn-primary">发送</button>
        </form>
        <div class="chat-side" data-chat-side>
          <div class="chat-record" data-chat-record>
            <h4>客户记录 / 下一步任务</h4>
            <div class="record-empty">暂无记录，发送消息后自动生成。</div>
          </div>
        </div>
      </div>
    </div>
  `
  const windowEl = root.querySelector('[data-chat-window]')
  const form = root.querySelector('[data-chat-form]')
  const input = root.querySelector('.chat-input')
  const record = root.querySelector('[data-chat-record]')

  function addMsg(text, type, meta) {
    const div = document.createElement('div')
    div.className = 'msg-row ' + type
    const avatar = type === 'msg-out' ? AVATAR_AGENT : AVATAR_USER
    div.innerHTML = `${avatar}<div class="msg-bubble">${esc(text)}</div>`
    if (meta) {
      const m = document.createElement('div')
      m.className = 'chat-meta'
      m.innerHTML = meta
      const bubble = div.querySelector('.msg-bubble')
      bubble.appendChild(m)
    }
    windowEl.appendChild(div)
    windowEl.scrollTop = windowEl.scrollHeight
  }

  function addRecord(text) {
    record.querySelector('.record-empty')?.remove()
    const d = document.createElement('div')
    d.className = 'record-item'
    d.innerHTML = esc(text)
    record.appendChild(d)
  }

  // 处理一条用户消息（供表单提交与快捷选项点击复用）
  function handleQuery(raw) {
    const q = raw.trim()
    if (!q) return
    addMsg(q, 'msg-in')
    input.value = ''

    const matched = matchIntent(q)
    // 未命中任何意图 → 澄清流程
    if (!matched) {
      const r = unknownReply
      const suggestionBtns = (r.suggestions || [])
        .map((s) => `<button class="kb-chip chat-suggest" data-suggest="${esc(s)}" type="button">${esc(s)}</button>`)
        .join('')
      addMsg(
        r.reply,
        'msg-out',
        `<span class="badge badge-warn"><span class="badge-dot"></span>${esc(r.intent)} · 待澄清</span><span class="chat-src">依据：${esc(r.source)}</span><div class="chat-suggest-row">${suggestionBtns}</div>`
      )
      addRecord(`未识别明确意图，已进入澄清流程（提供快捷选项）`)
      return
    }

    const { intent, hits } = matched
    const badgeCls = intent.autoHandle ? 'badge-success' : 'badge-warn'
    const statusLabel = intent.autoHandle ? '自动回复' : '需人工确认'
    const keywordLabel = hits.slice(0, 3).map((k) => `「${esc(k)}」`).join('、')
    addMsg(
      intent.reply,
      'msg-out',
      `<span class="badge ${badgeCls}"><span class="badge-dot"></span>${esc(intent.intent)} · ${statusLabel}</span>
       <span class="chat-src">命中关键词：${keywordLabel}</span>
       <span class="chat-src">依据：${esc(intent.source)}</span>`
    )
    if (intent.autoHandle) {
      addRecord(`已识别意图「${intent.intent}」，自动回复完成；下一步：${intent.intent === '营业时间查询' ? '可继续咨询预约' : intent.intent === '价格咨询' ? '可引导了解具体项目' : intent.intent === '预约咨询' ? '待补充预约日期与服务项目' : '等待客户进一步反馈'}`)
    } else {
      addRecord(`已创建人工接管任务：意图「${intent.intent}」需人工确认（含「${intent.intent}」属高风险/需核对场景）`)
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    handleQuery(input.value)
  })

  // 快捷建议按钮：点击后作为一条新消息继续处理
  windowEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-suggest]')
    if (!btn) return
    handleQuery(btn.dataset.suggest)
  })
}

// ---------- 2. CSV 数据清洗 ----------
export function initCsvDemo(root) {
  if (!root) return
  root.innerHTML = `
    <div class="demo-widget">
      <div class="demo-widget-head">
        <h3>CSV 数据清洗演示</h3>
        <span class="badge badge-info"><span class="badge-dot"></span>数据清洗</span>
      </div>
      <div class="demo-widget-body">
        <h4 class="mt-6 mb-3">先看看这份表格有哪些问题</h4>
        <p class="text-muted" style="font-size:var(--fs-sm)">运行后，可以查看哪些字段被标准化、哪些记录被识别为重复，以及哪些数据需要人工核查。</p>
        <div class="clean-preview mt-3">
          <div class="clean-preview-item">
            <div class="clean-preview-head"><strong>案例 1：手机号格式不统一</strong><span class="industry-tag" style="padding:0.2rem 0.6rem;font-size:var(--fs-xs)">格式不统一</span></div>
            <div class="clean-preview-body">原始值：<code>138-1234-5678</code>　→　标准化结果：<code>13812345678</code></div>
          </div>
          <div class="clean-preview-item">
            <div class="clean-preview-head"><strong>案例 2：日期格式不统一</strong><span class="industry-tag" style="padding:0.2rem 0.6rem;font-size:var(--fs-xs)">日期格式不统一</span></div>
            <div class="clean-preview-body">原始值：<code>2026/10/28</code>　→　标准化结果：<code>2026-10-28</code></div>
          </div>
          <div class="clean-preview-item">
            <div class="clean-preview-head"><strong>案例 3：重复订单记录</strong><span class="industry-tag" style="padding:0.2rem 0.6rem;font-size:var(--fs-xs)">重复记录</span></div>
            <div class="clean-preview-body">两条订单具有相同订单号和相同商品明细，将被识别为疑似重复记录。</div>
          </div>
          <div class="clean-preview-item">
            <div class="clean-preview-head"><strong>案例 4：缺少订单号或实付金额</strong><span class="industry-tag" style="padding:0.2rem 0.6rem;font-size:var(--fs-xs)">关键字段缺失</span></div>
            <div class="clean-preview-body">关键字段为空，将被标记为「待核查」，不会直接删除。</div>
          </div>
        </div>

        <div class="mt-4">
          <button class="btn btn-primary" data-run-clean>运行清洗</button>
          <button class="btn btn-secondary" data-export-clean disabled>导出清洗结果 CSV</button>
        </div>
        <div class="clean-result mt-4" data-clean-result>
          <div class="clean-empty">尚未运行清洗。</div>
        </div>
      </div>
    </div>
  `
  const runBtn = root.querySelector('[data-run-clean]')
  const exportBtn = root.querySelector('[data-export-clean]')
  const resultEl = root.querySelector('[data-clean-result]')
  let lastResult = null

  // 从原始行中提取一个可读的展示片段
  function brief(row) {
    const parts = []
    if (row.orderNo) parts.push('订单号 ' + row.orderNo)
    if (row.phone) parts.push('手机号 ' + row.phone)
    if (row.orderTime) parts.push('时间 ' + row.orderTime)
    if (row.name) parts.push(row.name)
    return parts.join(' · ') || '（空记录）'
  }
  function briefAfter(row) {
    if (!row) return '已去除'
    const parts = []
    if (row.orderNo) parts.push('订单号 ' + row.orderNo)
    if (row.phone) parts.push('手机号 ' + row.phone)
    if (row.orderTime) parts.push('时间 ' + row.orderTime)
    return parts.join(' · ')
  }

  runBtn.addEventListener('click', () => {
    runBtn.disabled = true
    runBtn.textContent = '清洗中…'
    setTimeout(() => {
      const result = runCleaning()
      lastResult = result
      const totalBefore = result.customers.before + result.orders.before + result.members.before
      const totalAfter = result.customers.after + result.orders.after + result.members.after
      const totalDup = result.customers.duplicates + result.orders.duplicates + result.members.duplicates
      const totalAnomaly = result.customers.anomalies + result.orders.anomalies + result.members.anomalies
      const totalMissing = result.customers.missingFields + result.orders.missingFields + result.members.missingFields

      // 汇总三份数据集的处理日志（取前 12 条用于对照展示）
      const allActions = [
        ...result.customers.actions,
        ...result.orders.actions,
        ...result.members.actions,
      ].slice(0, 12)

      resultEl.innerHTML = `
        <div class="metric-row">
          <div class="metric-card"><div class="metric-value">${totalBefore}</div><div class="metric-label">处理前记录数</div></div>
          <div class="metric-card"><div class="metric-value">${totalAfter}</div><div class="metric-label">处理后记录数</div></div>
          <div class="metric-card"><div class="metric-value">${totalDup}</div><div class="metric-label">重复记录</div></div>
          <div class="metric-card"><div class="metric-value">${totalAnomaly}</div><div class="metric-label">异常行</div></div>
          <div class="metric-card"><div class="metric-value">${totalMissing}</div><div class="metric-label">缺失字段</div></div>
        </div>
        <h4 class="mt-6 mb-4">各数据集明细</h4>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>数据集</th><th>处理前</th><th>处理后</th><th>重复</th><th>异常</th><th>缺失字段</th></tr></thead>
            <tbody>
              ${['customers', 'orders', 'members']
                .map((k) => {
                  const r = result[k]
                  const name = { customers: '订单主表', orders: '订单明细', members: '会员信息' }[k]
                  return `<tr><td>${name}</td><td class="num">${r.before}</td><td class="num">${r.after}</td><td class="num">${r.duplicates}</td><td class="num">${r.anomalies}</td><td class="num">${r.missingFields}</td></tr>`
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <h4 class="mt-6 mb-3">看看具体发生了什么变化（节选）</h4>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>原始记录</th><th>识别的问题</th><th>处理动作</th><th>处理后结果</th><th>当前状态</th></tr></thead>
            <tbody>
              ${allActions
                .map((a) => {
                  const statusCls = a.status === '已去重' ? 'badge-warn' : a.status === '待核查' ? 'badge-warn' : 'badge-success'
                  return `<tr><td class="cell-break">${esc(brief(a.original))}</td><td>${esc(a.problem)}</td><td class="cell-break">${esc(a.action || '—')}</td><td class="cell-break">${esc(briefAfter(a.after))}</td><td><span class="badge ${statusCls}" style="white-space:nowrap"><span class="badge-dot"></span>${esc(a.status)}</span></td></tr>`
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="note note-warn mt-4">
          <span class="note-icon">⚠</span>
          <span>以上数据为合成测试样本（共 ${totalBefore} 行），统计值来自本次实际运行结果，不代表任何真实客户数据。被去重的记录已说明判定依据；信息不足的记录保留「待核查」状态，未直接删除。</span>
        </div>
      `
      exportBtn.disabled = false
      runBtn.disabled = false
      runBtn.textContent = '重新运行清洗'
    }, 50)
  })

  exportBtn.addEventListener('click', () => {
    if (!lastResult) return
    const all = [...lastResult.customers.rows, ...lastResult.orders.rows, ...lastResult.members.rows]
    const csv = toCsv(all)
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '清洗结果.csv'
    a.click()
    URL.revokeObjectURL(url)
  })
}

// ---------- 3. 社媒评论截流筛选 ----------
export function initLeadsDemo(root) {
  if (!root) return
  const platforms = [...new Set(leadComments.map((c) => c.platform))]
  const industries = [...new Set(leadComments.map((c) => c.industry))]

  // 平台标识（仿真实平台的小 logo + 配色）
  function platformBadge(p) {
    if (p === '小红书') return `<span class="lead-platform platform-小红书">小红书</span>`
    return `<span class="lead-platform platform-抖音">抖音</span>`
  }

  // 三张精选评论卡片（强 / 中 / 弱意向），配合真实截图展示
  const featuredCards = [
    {
      nickname: '晚风轻轻',
      platform: '小红书',
      content: '这款套餐怎么预约？地址在哪里？',
      likes: 128,
      intent: '高意向 · 预约咨询',
      intentCls: 'badge-success',
      reason: '同时询问预约方式和到店地址，存在明确行动意图。',
      reply: '您好，可以帮您确认预约方式和门店地址。您方便说一下想预约的日期和服务项目吗？',
      next: '建议优先跟进',
    },
    {
      nickname: '阿泽在杭州',
      platform: '抖音',
      content: '这个项目多少钱？效果怎么样？',
      likes: 86,
      intent: '中等意向 · 价格与效果咨询',
      intentCls: 'badge-info',
      reason: '正在了解价格与效果，仍处于评估阶段。',
      reply: '您好，具体价格会根据服务项目有所不同。您更关注价格区间，还是想先了解项目适不适合自己的情况？',
      next: '继续了解需求',
    },
    {
      nickname: '小鹿乱撞',
      platform: '小红书',
      content: '看起来不错，先收藏了。',
      likes: 45,
      intent: '弱意向 · 兴趣关注',
      intentCls: 'badge-warn',
      reason: '表达兴趣，但没有明确询价、预约或购买动作。',
      reply: '暂不主动强推，后续观察是否出现进一步咨询。',
      next: '加入观察名单',
    },
  ]

  root.innerHTML = `
    <div class="demo-widget">
      <div class="demo-widget-head">
        <h3>社媒评论截流演示</h3>
        <span class="badge badge-simulation"><span class="badge-dot"></span>评论截流</span>
      </div>
      <div class="demo-widget-body">
        <h4 class="mt-6 mb-3">从一条评论，看出真实意向与下一步动作</h4>
        <p class="text-muted" style="font-size:var(--fs-sm)">从评论中识别高意向客户，转化为可执行的跟进动作。</p>

        <div class="lead-shot-grid mt-3">
          <figure class="lead-shot">
            <img src="../img/comment-xhs.png" alt="小红书评论区截图" loading="lazy" />
            <figcaption>小红书评论区 · 高意向评论「怎么预约 / 求地址」</figcaption>
          </figure>
          <figure class="lead-shot">
            <img src="../img/comment-douyin.png" alt="抖音评论区截图" loading="lazy" />
            <figcaption>抖音评论区 · 询价评论「多少钱 / 效果怎么样」</figcaption>
          </figure>
        </div>

        <div class="lead-featured mt-4">
          ${featuredCards
            .map(
              (c) => `
            <div class="lead-card lead-featured-card">
              <div class="lead-head">
                <div class="lead-user-meta"><strong>${esc(c.nickname)}</strong>${platformBadge(c.platform)}</div>
                <span class="badge ${c.intentCls}"><span class="badge-dot"></span>${esc(c.intent)}</span>
              </div>
              <div class="lead-desc" style="font-weight:600;color:var(--navy-900)">${esc(c.content)}</div>
              <div class="lead-reason"><strong>意向判断依据：</strong>${esc(c.reason)}</div>
              <div class="lead-reason"><strong>建议回复：</strong>${esc(c.reply)}</div>
              <div class="lead-reason"><strong>下一步：</strong>${esc(c.next)}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="lead-expand mt-4">
          <button class="btn btn-ghost lead-expand-toggle" type="button" data-lead-toggle aria-expanded="false">
            查看全部评论样例
            <svg class="lead-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <div class="lead-filter-panel" data-lead-panel style="display:none">
            <div class="filter-row mt-3">
              <div class="field" style="margin-bottom:0">
                <label>平台</label>
                <select data-filter-platform><option value="">全部平台</option>${platforms.map((p) => `<option>${p}</option>`).join('')}</select>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>行业</label>
                <select data-filter-industry><option value="">全部行业</option>${industries.map((i) => `<option>${i}</option>`).join('')}</select>
              </div>
              <div class="field" style="margin-bottom:0">
                <label>最低意向分</label>
                <select data-filter-score><option value="0">不限</option><option value="70">≥ 70</option><option value="80">≥ 80（高意向）</option></select>
              </div>
            </div>
            <div class="lead-list mt-4" data-lead-list></div>
          </div>
        </div>
      </div>
    </div>
  `
  const listEl = root.querySelector('[data-lead-list]')
  const selPlat = root.querySelector('[data-filter-platform]')
  const selInd = root.querySelector('[data-filter-industry]')
  const selScore = root.querySelector('[data-filter-score]')
  const toggleBtn = root.querySelector('[data-lead-toggle]')
  const panel = root.querySelector('[data-lead-panel]')

  function render() {
    const plat = selPlat.value
    const ind = selInd.value
    const minScore = Number(selScore.value)
    const filtered = leadComments.filter(
      (c) => (!plat || c.platform === plat) && (!ind || c.industry === ind) && c.score >= minScore
    )
    if (!filtered.length) {
      listEl.innerHTML = '<div class="clean-empty">没有符合条件的评论。</div>'
      return
    }
    listEl.innerHTML = filtered
      .map(
        (c) => `
        <div class="lead-card">
          <div class="lead-head">
            <div class="lead-user-meta"><strong>${esc(c.nickname)}</strong>${platformBadge(c.platform)}</div>
            <span class="badge badge-info"><span class="badge-dot"></span>意向 ${c.score}</span>
          </div>
          <div class="lead-meta">${esc(c.industry)} · 点赞 ${c.likes}（虚构）</div>
          <p class="lead-desc">${esc(c.content)}</p>
          <div class="lead-tags"><span class="industry-tag" style="padding:0.2rem 0.6rem;font-size:var(--fs-xs)">${esc(c.intent)}</span></div>
          <div class="lead-reason"><strong>评分依据：</strong>${esc(c.reason)}</div>
          <div class="lead-reason"><strong>建议互动：</strong>${esc(c.reply)}</div>
        </div>
      `
      )
      .join('')
  }

  // 折叠/展开全部评论
  toggleBtn.addEventListener('click', () => {
    const open = panel.style.display !== 'none'
    panel.style.display = open ? 'none' : 'block'
    toggleBtn.setAttribute('aria-expanded', String(!open))
  })

  selPlat.addEventListener('change', render)
  selInd.addEventListener('change', render)
  selScore.addEventListener('change', render)
  render()
}

// ---------- 5. GEO 品牌 AI 搜索可见度（展示型演示） ----------
export function initGeoDemo(root) {
  if (!root) return
  root.innerHTML = `
    <div class="demo-widget">
      <div class="demo-widget-head">
        <h3>GEO 品牌 AI 搜索可见度服务</h3>
        <span class="badge badge-simulation"><span class="badge-dot"></span>品牌 AI 搜索可见度</span>
      </div>
      <div class="demo-widget-body">
        <h4 class="mt-6 mb-3">GEO 服务流程</h4>
        <p class="text-muted" style="font-size:var(--fs-sm)">从品牌诊断到持续优化，四步帮你提升品牌在 AI 搜索中的可见度。</p>
        <figure class="geo-flow-figure">
          <img src="../img/geo-flow.png" alt="GEO 服务流程图：品牌诊断 → 内容策略 → 落地执行 → 监测优化" loading="lazy" />
        </figure>
      </div>
    </div>
  `
}

// ---------- 6. 企业定制自动化（展示型演示） ----------
export function initCustomDemo(root) {
  if (!root) return
  const nodes = [
    { step: '业务输入', desc: '订单/表单/消息等数据进入流程', type: 'input' },
    { step: '自动化处理', desc: '规则判断、字段转换、数据匹配', type: 'process' },
    { step: '人工审批', desc: '关键环节由负责人确认', type: 'approve' },
    { step: '结果输出', desc: '写入目标系统或生成报表', type: 'output' },
  ]

  root.innerHTML = `
    <div class="demo-widget">
      <div class="demo-widget-head">
        <h3>定制自动化工作流演示</h3>
        <span class="badge badge-info"><span class="badge-dot"></span>定制自动化</span>
      </div>
      <div class="demo-widget-body">
        <div class="custom-flow mt-6">
          ${nodes
            .map(
              (n, i) => `
            <div class="custom-flow-node custom-flow-${n.type}">
              <span class="custom-flow-num">${i + 1}</span>
              <div class="custom-flow-body">
                <h4>${esc(n.step)}</h4>
                <p>${esc(n.desc)}</p>
              </div>
            </div>
            ${i < nodes.length - 1 ? '<div class="custom-flow-arrow">↓</div>' : ''}
          `
            )
            .join('')}
        </div>

        <h4 class="mt-6 mb-3">异常处理机制</h4>
        <ul class="check-list">
          <li>数据缺失或格式异常 → 自动标记，等待人工补全。</li>
          <li>处理失败 → 自动重试，超过阈值转人工。</li>
          <li>审批不通过 → 回退到上游环节并记录原因。</li>
        </ul>

        <h4 class="mt-6 mb-3">适合定制的业务环节</h4>
        <div class="flex flex-wrap gap-2">
          ${['订单录入', '报表汇总', '消息分派', '审批流转', '数据同步', '自动对账']
            .map((t) => `<span class="industry-tag">${t}</span>`)
            .join('')}
        </div>

        <div class="custom-contact mt-6">
          <div class="custom-contact-head">需要定制你的自动化流程？</div>
          <p class="custom-contact-sub">把你的业务流程和痛点告诉我，我来为你设计专属的自动化方案。</p>
          <div class="custom-contact-info">
            <div class="custom-contact-name">联系人：刘浩</div>
            <a class="btn btn-primary btn-lg" href="tel:18435736138">电话 / 微信：18435736138</a>
          </div>
        </div>
      </div>
    </div>
  `
}

// ---------- 4. 知识库问答 ----------
export function initKbDemo(root) {
  if (!root) return
  root.innerHTML = `
    <div class="demo-widget">
      <div class="demo-widget-head">
        <h3>企业知识库问答演示</h3>
        <span class="badge badge-info"><span class="badge-dot"></span>知识库问答</span>
      </div>
      <div class="demo-widget-body">
        <div class="mt-4">
          <div class="kb-chips">
            ${knowledgeBase.map((k) => `<button class="kb-chip" data-kb-q="${esc(k.q)}">${esc(k.q)}</button>`).join('')}
          </div>
        </div>
        <form class="chat-form mt-4" data-kb-form>
          <input type="text" class="chat-input" placeholder="输入问题，例如：退换货政策是什么？" autocomplete="off" />
          <button type="submit" class="btn btn-primary">提问</button>
        </form>
        <div class="kb-answer mt-4" data-kb-answer>
          <div class="clean-empty">输入问题查看答案。</div>
        </div>
      </div>
    </div>
  `
  const form = root.querySelector('[data-kb-form]')
  const input = root.querySelector('.chat-input')
  const answerEl = root.querySelector('[data-kb-answer]')
  const chips = root.querySelectorAll('[data-kb-q]')

  function ask(q) {
    const query = q.trim()
    if (!query) return
    let matched = null
    for (const item of knowledgeBase) {
      if (item.keywords.some((k) => query.includes(k))) {
        matched = item
        break
      }
    }
    const result = matched || kbUnknownAnswer
    const isUnknown = !matched
    answerEl.innerHTML = `
      <div class="kb-answer-card ${isUnknown ? 'kb-unknown' : ''}">
        <div class="kb-answer-q">问：${esc(query)}</div>
        <div class="kb-answer-a">${esc(result.answer)}</div>
        <div class="kb-answer-src">
          <span class="badge ${isUnknown ? 'badge-warn' : 'badge-success'}"><span class="badge-dot"></span>${esc(result.category)}</span>
          <span class="kb-src-text">来源：${esc(result.source)}</span>
        </div>
      </div>
    `
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    ask(input.value)
    input.value = ''
  })
  chips.forEach((chip) => {
    chip.addEventListener('click', () => ask(chip.dataset.kbQ))
  })
}
