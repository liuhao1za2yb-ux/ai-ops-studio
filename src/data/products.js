// ============================================================
// 产品数据 —— 六个产品
// 注意：能力、流程、交付范围均基于可验证的产品功能描述，
// 不包含虚构客户、业绩数字、排名或资质。
// ============================================================
export const products = [
  {
    slug: 'ai-customer-service',
    name: 'AI 客服与线索跟进',
    short: '自动接待客户咨询，识别意图，跟进线索不遗漏',
    problem: '客户消息分散在多个渠道，高峰期回复不及时，跟进容易遗漏，人工难以统一记录。',
    capabilities: ['意图识别与分类', '资料检索与自动回复', '客户记录与跟进提醒'],
    demoRoute: 'demos/#chat',
    icon: 'chat',
  },
  {
    slug: 'ai-lead-generation',
    name: '社媒评论截流与线索挖掘',
    short: '从小红书、抖音评论区识别高意向用户，自动互动沉淀线索',
    problem: '潜在客户就藏在热门笔记和视频的评论区里，手动翻找费时、易漏、真假难辨。',
    capabilities: ['高意向评论识别', '评论互动与私信跟进', '线索沉淀与去重'],
    demoRoute: 'demos/#leads',
    icon: 'comment',
  },
  {
    slug: 'geo-brand-visibility',
    name: 'GEO 品牌 AI 搜索可见度诊断',
    short: '分析品牌在 AI 搜索中的被提及与回答情况，给出优化建议',
    problem: '企业不清楚自己在 AI 搜索回答中的可见度，缺少针对性的内容优化方向。',
    capabilities: ['真实测试问题诊断', '品牌提及与回答来源分析', '竞争内容与优化建议'],
    demoRoute: 'demos/#geo',
    icon: 'search',
  },
  {
    slug: 'data-automation',
    name: 'Excel 数据清洗与办公自动化',
    short: '去重、标准化、合并、匹配、异常标记，自动化处理表格',
    problem: '多份表格反复合并、核对、统计，字段格式不一致，人工处理耗时易错。',
    capabilities: ['去重与字段标准化', '多表合并与订单号匹配', '异常标记与处理日志'],
    demoRoute: 'demos/#csv',
    icon: 'table',
  },
  {
    slug: 'knowledge-base-qa',
    name: '企业知识库与数据库问答',
    short: '让员工用自然语言查询文档与业务数据，带权限校验',
    problem: '企业资料分散，重复问题多，业务数据查询需要人工操作，无法快速获取答案。',
    capabilities: ['静态文档检索', '实时业务数据库查询', '权限校验与来源标注'],
    demoRoute: 'demos/#kb',
    icon: 'book',
  },
  {
    slug: 'custom-automation',
    name: '企业定制 AI 自动化',
    short: '针对具体业务流程，定制从输入到输出的自动化方案',
    problem: '业务系统之间需要人工传递信息，企业不清楚哪些环节值得自动化。',
    capabilities: ['业务流程梳理与诊断', '定制自动化工作流', '异常处理与人工审批'],
    demoRoute: 'demos/#custom',
    icon: 'gear',
  },
]

export function getProduct(slug) {
  return products.find((p) => p.slug === slug)
}
