# 调色竞技场 (Palette Arena)

一个在线照片调色评测平台，用于比较两人的调色技术。支持A/B对比投票和单张评分两种模式。

## 功能特点

- **A/B 对比投票**: 同一原图的两种调色版本，盲评选择更喜欢的
- **单张评分**: 逐张浏览调色作品，1-5星评分
- **统计看板**: 查看胜率、平均分等统计数据
- **盲评机制**: 投票/评分时不显示作者信息

## 技术栈

- React 18 + TypeScript + Vite
- TailwindCSS
- LeanCloud (数据存储)
- SM.MS (图床)
- Recharts (图表)

## 本地开发

1. 克隆仓库
```bash
git clone https://github.com/ZhengtongDu/Palette-Arena.git
cd Palette-Arena
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 LeanCloud 和 SM.MS 配置
```

4. 启动开发服务器
```bash
npm run dev
```

## 环境变量配置

| 变量名 | 说明 |
|--------|------|
| VITE_LEANCLOUD_APP_ID | LeanCloud App ID |
| VITE_LEANCLOUD_APP_KEY | LeanCloud App Key |
| VITE_LEANCLOUD_SERVER_URL | LeanCloud 服务器地址 |
| VITE_SMMS_TOKEN | SM.MS API Token |

## LeanCloud 数据表结构

### Photo 照片表
- `url`: 图片URL
- `author`: 作者 ("A" 或 "B")
- `originalId`: 原图标识
- `title`: 标题（可选）

### Vote 投票表
- `originalId`: 原图标识
- `winner`: 获胜者 ("A" 或 "B")
- `voter`: 投票者昵称

### Rating 评分表
- `photoId`: 照片ID
- `score`: 评分 (1-5)
- `voter`: 评分者昵称

## 部署

项目配置了 GitHub Actions 自动部署到 GitHub Pages。

1. 在仓库 Settings > Secrets 中添加环境变量
2. 在 Settings > Pages 中启用 GitHub Pages，选择 GitHub Actions 作为来源
3. 推送到 main 分支即可自动部署

## 后台密码

默认后台密码: `palette2024`

可在 `src/pages/Dashboard.tsx` 中修改 `DASHBOARD_PASSWORD` 常量。

## License

MIT
