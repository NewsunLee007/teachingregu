# 滚动稳定性测试报告（模板+可复现脚本）

## 1. 背景
- 目标：用户手动滚动后 3 秒内不发生非用户触发的滚动偏移（回弹/抖动）。
- 核心防护：锁定滚动期间的自动滚动请求，目录高亮不触发滚动。

## 2. 修复点
- 目录高亮改为只更新状态与 hash（replaceState），不再触发 click/scroll 链路。
- 在 `#scrollContainer` 绑定 wheel/touchstart/keydown/scroll 的 passive 监听，写入 3s 锁（scroll lock）。

## 3. 自动化脚本
- Playwright（需下载浏览器）：`npm run test:ui`
  - 覆盖：非法路由重定向、跨科目阻止、3 秒滚动稳定、Tab 定位居中
  - 说明：若环境无法下载 Playwright 浏览器，请使用“手动脚本”方案。

## 4. 手动脚本（无需额外依赖）
- 在浏览器打开 `index.html` 后，打开 DevTools 控制台，粘贴执行：
  - [tests/scroll_stability.manual.js](file:///Users/newsunlee/Desktop/AI%20for%20learning/Teaching%20regulation/tests/scroll_stability.manual.js)

## 5. 跨浏览器测试记录（待填写）
| 浏览器 | 设备/系统 | 场景 | 结果 | 备注 |
|---|---|---|---|---|
| Chrome | macOS | 滚动 1200px，停 3s |  |  |
| Safari | macOS | 滚动 1200px，停 3s |  |  |
| Firefox | macOS | 滚动 1200px，停 3s |  |  |

