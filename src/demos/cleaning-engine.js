// ============================================================
// 数据清洗引擎 —— 真实运行去重、标准化、异常标记、统计
// 结果由实际数据处理计算得出，不是预设百分比
// 同时为每条记录输出「处理动作」，用于前端前后对照展示
// ============================================================
import { generateCsvDatasets } from './demo-data.js'

// 标准化手机号：去除空格和横线
export function normalizePhone(p) {
  if (!p) return ''
  return String(p).replace(/[\s-]/g, '')
}

// 标准化日期：统一为 YYYY-MM-DD
export function normalizeDate(d) {
  if (!d) return ''
  return String(d).replace(/\//g, '-')
}

// 清洗单个数据集，返回处理结果 + 每条记录的处理详情
// keyFn(row) 返回用于去重的键
export function cleanDataset(rows, keyFn) {
  const seen = new Map()
  const cleaned = []
  // 处理日志：每一条被处理的记录的动作记录（用于「处理前后对照」）
  const actions = []
  let duplicates = 0
  let anomalies = 0
  let missingFields = 0

  rows.forEach((row) => {
    // 标准化字段（手机号、日期）
    const stdRow = { ...row }
    const fieldChanges = []
    if (stdRow.phone !== undefined && stdRow.phone !== normalizePhone(stdRow.phone)) {
      fieldChanges.push({ field: '手机号', from: stdRow.phone, to: normalizePhone(stdRow.phone) })
      stdRow.phone = normalizePhone(stdRow.phone)
    }
    if (stdRow.orderTime !== undefined && stdRow.orderTime !== normalizeDate(stdRow.orderTime)) {
      fieldChanges.push({ field: '下单时间', from: stdRow.orderTime, to: normalizeDate(stdRow.orderTime) })
      stdRow.orderTime = normalizeDate(stdRow.orderTime)
    }
    if (stdRow.joinDate !== undefined && stdRow.joinDate !== normalizeDate(stdRow.joinDate)) {
      fieldChanges.push({ field: '日期', from: stdRow.joinDate, to: normalizeDate(stdRow.joinDate) })
      stdRow.joinDate = normalizeDate(stdRow.joinDate)
    }

    // 统计缺失字段
    let rowHasMissing = false
    for (const k of Object.keys(stdRow)) {
      if (stdRow[k] === '' || stdRow[k] === null || stdRow[k] === undefined) {
        missingFields++
        rowHasMissing = true
      }
    }

    // 计算去重键（用标准化后的字段）
    const key = keyFn(stdRow)
    if (seen.has(key)) {
      // 重复记录
      duplicates++
      actions.push({
        original: row,
        problem: '重复记录',
        action: '识别为疑似重复记录，已去除',
        after: null,
        status: '已去重',
      })
    } else {
      seen.set(key, true)
      const phone = stdRow.phone
      const phoneInvalid = phone && normalizePhone(phone).length !== 11
      const isAnomaly = phoneInvalid || rowHasMissing

      let problem = []
      if (fieldChanges.length) problem.push('格式不统一')
      if (phoneInvalid) problem.push('手机号异常')
      if (rowHasMissing) problem.push('关键字段缺失')
      const problemLabel = problem.length ? problem.join('、') : '无异常'

      if (isAnomaly) anomalies++
      stdRow.__anomaly = isAnomaly
      cleaned.push(stdRow)

      // 记录动作（仅记录有问题或有格式变更的行，避免日志过长）
      if (fieldChanges.length || rowHasMissing || phoneInvalid) {
        actions.push({
          original: row,
          problem: problemLabel,
          action: fieldChanges.length
            ? fieldChanges.map((c) => `${c.field}：${c.from} → ${c.to}`).join('；')
            : '',
          after: stdRow,
          status: rowHasMissing || phoneInvalid ? '待核查' : '已标准化',
        })
      }
    }
  })

  return {
    before: rows.length,
    after: cleaned.length,
    duplicates,
    anomalies,
    missingFields,
    rows: cleaned,
    actions,
  }
}

// 运行完整清洗流程
export function runCleaning() {
  const { customers, orders, members } = generateCsvDatasets()

  const custResult = cleanDataset(customers, (r) => normalizePhone(r.phone) + '|' + r.orderNo)
  const orderResult = cleanDataset(orders, (r) => r.orderNo + '|' + r.sku)
  const memberResult = cleanDataset(members, (r) => normalizePhone(r.phone) + '|' + r.name)

  return { customers: custResult, orders: orderResult, members: memberResult }
}

// 导出 CSV 文本
export function toCsv(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0]).filter((k) => !k.startsWith('__'))
  const lines = [headers.join(',')]
  rows.forEach((r) => {
    const vals = headers.map((h) => {
      let v = r[h] ?? ''
      v = String(v)
      if (v.includes(',') || v.includes('"') || v.includes('\n')) {
        v = '"' + v.replace(/"/g, '""') + '"'
      }
      return v
    })
    lines.push(vals.join(','))
  })
  return lines.join('\n')
}
