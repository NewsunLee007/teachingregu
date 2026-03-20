# 温州市初中教学常规（2025）离线交互版

## 1. 简介
本项目是一个纯前端、无外部依赖的单页应用（SPA），完整收录《温州市初中教学常规（2025年版）》全文，提供学科导航、内容检索、夜间模式、Excel 表格导出及学习内容检测功能。

## 2. 文件结构
- `index.html`: 主入口文件（重构版，分离 CSS/JS）。
- `script.js`: 核心交互逻辑（路由拦截、子目录 Tabs、滚动稳定）。
- `styles.css`: 全局样式与日间主题（Typography、Layout）。
- `dark.css`: 夜间模式专用样式（高对比度）。
- `data/`: 存放学科题库 JSON 与 SVG 资源。
- `__tests__/`: 自动化测试用例（需安装 Node环境）。
- `tests/`: UI 自动化测试用例（Playwright，需下载浏览器）。
- `reports/`: DOM diff、Lighthouse 报告与走查材料。

## 3. 使用方法
### 方式一：本地预览（推荐）
由于浏览器安全策略限制（CORS），直接双击打开 HTML 可能导致 JSON 数据加载失败。建议使用 Python 启动本地服务器：

```bash
# 进入项目目录
cd "/Users/newsunlee/Desktop/AI for learning/Teaching regulation"

# 启动服务器
python3 -m http.server 8000
```

然后在浏览器访问：[http://localhost:8000/index.html](http://localhost:8000/index.html)

### 方式二：直接打开
若仅浏览内容，可直接双击 `index.html`，但“学习检测”功能可能无法加载题库。

## 4. 功能特性
- **界面美化**：独立排版体系，符合 WCAG 2.1 AA 对比度标准。
- **目录交互**：左侧学科主目录 + 顶部横向子目录 Tabs；目录与正文滚动高亮同步。
- **夜间模式**：自动跟随系统偏好，支持手动切换并记忆。
- **表格交互**：原生 HTML 表格，支持列宽拖拽、排序与 Excel 导出。
- **学习检测**：包含 10 个学科的随机题库与证书生成。

## 5. 开发与测试
若需运行测试用例，请先安装依赖：
```bash
npm install
npm test
npm run test:ui
```


## 本地离线打开

该页面为离线交互版（不依赖 CDN），但题库 JSON 和马年 SVG 动画通过 `fetch()` 加载，因此建议使用本地静态服务器访问。

### 推荐方式（本地静态服务器）

在本目录执行：

```bash
python3 -m http.server 8000
```

浏览器打开：

- http://localhost:8000/index.html

## 浏览器版本要求

- Chrome / Edge / Firefox / Safari：建议最新 2 个大版本。

## 题库更新格式（data/*.json）

每个文件为一个学科：

- subject：学科名称
- subjectKey：学科键（与文件名一致）
- questions：题目数组
  - type：single | multi | tf | fill
  - stem：题干（来自原文原句）
  - options：选项（single/multi）
  - answer：答案（single 为索引，multi 为索引数组，tf 为布尔值，fill 为字符串）
  - source.quote：原文出处（用于页面内高亮定位）
