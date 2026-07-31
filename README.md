# WBH 成交教練（Eva Sales Coach）

AI 成交陪練系統：AI 扮香港真實客人原型同你對答，完場用顧問式成交八格評分＋逐句回放。

## 本機用法
1. 喺呢個 folder 開個 `config.js`：
   ```js
   window.COACH_CONFIG = { key: "你嘅OpenRouter key", model: "anthropic/claude-sonnet-4.5" };
   ```
2. 撳 `WBH成交教練.command`（或者直接開 `index.html`）。

## 上線版（GitHub Pages）
`config.js` 唔會上傳（.gitignore 剔除咗）。上線版第一次開會叫你貼 access key，只儲喺該部裝置瀏覽器。
⚠️ 學員多人版需要 backend 代理 API key＋雲端帳戶（見 roadmap）。

## 檔案
- `index.html` — 成個 app（登入/練習/評分/成績表）
- `data.js` — 數據腦（40 個客人案例·rubric·香港客行為引擎），Eva 定期更新
