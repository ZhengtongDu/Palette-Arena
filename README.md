# 调色竞技场 (Palette Arena)

一个在线照片调色评测平台，用于比较两人的调色技术。支持A/B对比投票和单张评分两种模式。

## 功能特点

- **A/B 对比投票**: 同一原图的两种调色版本，盲评选择更喜欢的
- **单张评分**: 逐张浏览调色作品，1-5星评分
- **统计看板**: 查看胜率、平均分等统计数据
- **照片管理**: 上传和管理照片配对
- **盲评机制**: 投票/评分时不显示作者信息

## 技术栈

- React 18 + TypeScript + Vite
- TailwindCSS
- Bmob (数据存储)
- SM.MS (图床，可选)
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

3. 启动开发服务器
```bash
npm run dev
```

4. 访问 http://localhost:5173/Palette-Arena/

## 环境变量配置（可选）

如需使用自己的 Bmob 应用，创建 `.env` 文件：

| 变量名 | 说明 |
|--------|------|
| VITE_BMOB_APP_ID | Bmob Application ID |
| VITE_BMOB_REST_API_KEY | Bmob REST API Key |
| VITE_SMMS_TOKEN | SM.MS API Token（文件上传模式需要）|

## Bmob 数据表结构

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

1. 在仓库 Settings > Secrets 中添加环境变量（可选）
2. 在 Settings > Pages 中启用 GitHub Pages，选择 GitHub Actions 作为来源
3. 推送到 main 分支即可自动部署

## 管理密码

默认管理密码: `palette2024`

可在以下文件中修改：
- `src/pages/Dashboard.tsx` - `DASHBOARD_PASSWORD` 常量
- `src/pages/Admin.tsx` - `ADMIN_PASSWORD` 常量

## License

MIT
