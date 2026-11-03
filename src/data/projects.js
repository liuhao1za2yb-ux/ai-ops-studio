// ============================================================
// 项目实践数据 —— 前 3 个真实实践（仅已知事实），后 3 个明确标注模拟
// ============================================================
export const projects = [
  {
    slug: 'beauty-industry-automation',
    title: '美业业务数据与运营自动化',
    category: '项目实践',
    status: '项目实践',
    isSimulation: false,
    description: '围绕美业门店的日常订单数据处理、预约排期辅助与运营建议输出展开的自动化实践。',
    image: 'img/project-beauty.png',
  },
  {
    slug: 'wechat-crm-prototype',
    title: '微信客户维护自动化原型',
    category: '原型验证',
    status: '原型验证',
    isSimulation: false,
    description: '通过视觉操作方式探索微信聊天界面的自动化处理，研究消息识别、自动回复与客户信息维护。',
    image: 'img/project-wechat-crm.png',
  },
  {
    slug: 'ai-api-config',
    title: 'AI API 调用与配置管理',
    category: '工具实践',
    status: '工具实践',
    isSimulation: false,
    description: '多模型 API 配置、端点与密钥管理、调用与切换流程的工程实践。',
    image: 'img/project-ai-api.png',
  },
  {
    slug: 'lifestyle-store-cs',
    title: '生活服务门店 AI 客服',
    category: '模拟业务场景 · 模拟数据',
    status: '模拟业务场景 · 模拟数据',
    isSimulation: true,
    description: '可交互的模拟项目：100 条合成咨询记录、6 类意图、15 条需人工确认样例，展示意图识别、回复、客户记录与跟进任务。',
    image: 'img/project-store-cs.png',
  },
  {
    slug: 'b2b-lead-assistant',
    title: '社媒评论截流助手',
    category: '模拟业务场景 · 虚构数据',
    status: '模拟业务场景 · 虚构数据',
    isSimulation: true,
    description: '50 条虚构评论记录，覆盖小红书与抖音双平台，支持行业、平台、意向强度筛选，展示高意向评论识别、评分依据与互动建议。',
    image: 'img/project-lead-miner.png',
  },
  {
    slug: 'multi-table-cleaning',
    title: '多表清洗与经营报表',
    category: '模拟业务场景 · 合成数据',
    status: '模拟业务场景 · 合成数据',
    isSimulation: true,
    description: '3 份合成 CSV、总计 1,000 行测试数据，实际运行清洗逻辑，动态计算处理前后记录数、重复数与异常数。',
    image: 'img/project-data-clean.png',
  },
]

export function getProject(slug) {
  return projects.find((p) => p.slug === slug)
}
