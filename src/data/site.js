// ============================================================
// 全局站点配置 —— 集中管理，方便后续替换
// ============================================================
export const siteConfig = {
  brandName: '企业智能自动化工作室',
  tagline: '让 AI 真正进入企业的日常工作',
  subtitle:
    '从客户接待、社媒评论截流，到数据处理、知识问答与业务流程自动化，帮助企业把 AI 接入真实业务流程。',
  // 联系方式 —— 缺省时界面显示「联系方式待配置」，不得编造
  contact: {
    wechatQrPath: '', // 微信二维码图片路径，例如 '/assets/qr.png'
    phone: '18435736138', // 联系电话
    name: '刘浩', // 联系人姓名
    email: '', // 联系邮箱
    region: '', // 所在地区
    bookingNote: '', // 预约说明
  },
  // 导航（相对片段，运行时由 layout.js 依据页面层级拼接前缀，兼容根路径/子路径/file 部署）
  nav: [
    { label: '解决方案', href: 'solutions/' },
    { label: '产品演示', href: 'demos/' },
    { label: '项目实践', href: 'projects/' },
    { label: '合作流程', href: 'process/' },
    { label: '关于我们', href: 'about/' },
  ],
  cta: { label: '联系我们', href: 'contact/' },
}

// 适配静态托管下不同子目录的相对路径（base: './'）
export function asset(path) {
  return path
}
