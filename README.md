# 企业智能自动化工作室 — 官网与交互式演示中心

高端企业 AI 自动化官网，采用 **Vite + 原生多页 HTML/CSS/JS** 架构，纯静态构建，零后端依赖，适合 Cloudflare Pages 免费静态托管。

## 技术栈

- **Vite 5** — 构建工具（多页应用配置）
- **原生 HTML / CSS / JavaScript（ES Modules）** — 无前端框架、无 UI 库、无动画库
- **设计 Token** — 颜色、间距、字体、圆角、阴影、断点统一管理（`src/styles/design-system.css`）

## 目录结构

```
网站演示/
├── index.html                  # 首页
├── solutions/                  # 产品与解决方案
│   ├── index.html              #   产品列表
│   └── *.html                  #   6 个产品详情页
├── demos/index.html            # 产品演示中心（4 个交互演示 + GEO 说明）
├── projects/                   # 项目实践
│   ├── index.html              #   项目列表
│   └── *.html                  #   6 个项目详情页
├── process/index.html          # 合作流程
├── about/index.html            # 关于与能力边界
├── contact/index.html          # 联系我们
├── privacy/index.html          # 隐私说明
├── src/
│   ├── data/                   # 统一数据配置（品牌/产品/项目/演示数据）
│   ├── demos/                  # 4 个交互演示实现
│   ├── styles/                 # 设计系统 + 组件样式
│   ├── layout.js               # 共享导航/页脚
│   └── *.js                    # 页面渲染入口
└── vite.config.js              # 多页构建配置
```

## 本地开发（Windows PowerShell）

```powershell
# 1. 进入项目目录
cd "C:\Users\HUAYUSHITING\WorkBuddy\网站演示"

# 2. 安装依赖（首次）
npm install

# 3. 启动开发服务器
npm run dev
# 打开终端提示的地址，例如 http://localhost:5173

# 4. 构建生产版本
npm run build
# 产物输出到 dist/ 目录

# 5. 本地预览生产构建
npm run preview
```

## 部署到 Cloudflare Pages

### 方式一：通过 Cloudflare 控制台（推荐）

1. 将代码推送到 GitHub / GitLab 仓库。
2. 登录 Cloudflare 控制台 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
3. 选择你的仓库，配置如下：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `22`（或 20 及以上）
4. 点击 **Save and Deploy**。

### 方式二：通过 Wrangler CLI

```powershell
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
wrangler pages deploy dist --project-name=你的项目名
```

### GitHub 上传步骤（PowerShell）

```powershell
# 在项目目录下
git init
git add .
git commit -m "初始化企业 AI 自动化官网"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

> 建议先创建 `.gitignore`，排除 `node_modules/` 和 `dist/`。

## 品牌信息配置（替换入口）

所有品牌信息集中在 `src/data/site.js`：

| 字段 | 说明 |
|------|------|
| `brandName` | 品牌名称 |
| `contact.wechatQrPath` | 微信二维码图片路径 |
| `contact.phone` | 联系电话 |
| `contact.email` | 联系邮箱 |
| `contact.region` | 所在地区 |
| `contact.bookingNote` | 预约说明 |

> 联系方式缺省时，界面自动显示「联系方式待配置」，不会编造信息。

## 真实性说明

本项目严格遵守真实性要求：

- **3 个真实实践**（美业自动化、微信 CRM 原型、AI API 配置）仅描述已知事实，不虚构客户名称、业绩、效率提升比例。
- **3 个模拟案例**（生活服务客服、B2B 拓客、多表清洗）明确标注「模拟业务场景」，使用合成/虚构数据。
- 拓客演示的 50 条企业记录均为虚构，名称以「示例·」开头。
- 数据清洗演示的统计结果由清洗逻辑**实际运行**得出，非预设百分比。
- 联系表单为本地演示，不会伪装成功提交，提供「复制需求摘要」功能。

## 验收对照

- [x] 所有 20 个页面可打开（首页 + 7 主页面 + 6 产品详情 + 6 项目详情）
- [x] 6 个产品卡片均可进入详情页
- [x] 6 个项目均有详情页，3 真实 + 3 模拟明确区分
- [x] 4 个演示模块可实际操作（客服/清洗/拓客/知识库）
- [x] 数据清洗统计来自真实运行结果
- [x] 模拟拓客不使用真实客户信息
- [x] 所有联系入口状态诚实（待配置显示待配置）
- [x] 移动端无横向溢出（表格用 overflow-x 包裹）
- [x] 静态构建成功（`npm run build` 通过）
- [x] 可按 Cloudflare Pages 官方流程部署
