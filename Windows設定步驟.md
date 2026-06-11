# AI 文案生成器 - Windows 後端設定完整指南

## 🎯 目標
用 Node.js 建立一個安全的後端伺服器，讓 AI 文案工具可以安全運行。

## 📋 設定步驟（按順序做，不要跳步）

---

## 第 1 步：檢查 Node.js 安裝

### 1.1 打開命令提示字元
- 按 `Windows 鍵 + R`
- 輸入 `cmd` 
- 按 Enter

### 1.2 檢查 Node.js 版本
在黑色視窗中輸入：
```
node --version
```

**預期結果：** 應該看到 `v14.0.0` 或更高版本

如果看到「node 不是內部或外部命令」 = 沒有裝 Node.js
- 去 https://nodejs.org/ 下載 LTS 版本安裝
- 安裝後重新打開 CMD，再試一次

✅ 確認 Node.js 有裝好後，繼續下一步

---

## 第 2 步：安裝依賴套件

### 2.1 打開 Claude_Project 資料夾
1. 按 `Windows 鍵 + E`（打開檔案管理員）
2. 進入：`C:\Users\Huan\Desktop\Claude_Project`

### 2.2 在這個資料夾打開 CMD
1. 在檔案管理員的上方地址欄中，點一下
2. 刪除路徑，輸入：`cmd`
3. 按 Enter

   **或者用快速方法：**
   - 按 `Shift + 滑鼠右鍵`（在空白處）
   - 選「在此處開啟 PowerShell 視窗」

   **如果是 PowerShell，先輸入：**
   ```
   cmd
   ```
   然後按 Enter 切換到 CMD

### 2.3 檢查當前資料夾
輸入：
```
dir
```

**預期結果：** 應該看到：
- `package.json` ✅
- `server.js` ✅
- `ai-copywriter-backend.html` ✅
- `.env.example` ✅

如果看不到這些檔案，表示你在錯誤的資料夾，請回到 2.1 重新確認路徑

### 2.4 安裝依賴
輸入：
```
npm install
```

**這會做什麼：**
- 讀取 `package.json` 檔案
- 自動下載 Express、CORS、dotenv、OpenAI 套件
- 需要 1-3 分鐘完成

**預期結果：**
- 畫面會捲動，顯示正在安裝套件
- 最後看到 `added XX packages` 訊息
- 一個新的資料夾 `node_modules` 會出現（有點大，沒關係）

✅ 安裝完成後，繼續下一步

---

## 第 3 步：設定 API Key（最重要！）

### 3.1 複製 API Key
1. 去 https://platform.openai.com/account/api-keys
2. 登入你的 OpenAI 帳號
3. 點「Create new secret key」
4. 複製出現的金鑰（以 `sk-` 開頭）
5. **複製後馬上貼，不要分享給任何人**

### 3.2 建立 .env 檔案
1. 在 Claude_Project 資料夾中，用記事本新建一個檔案
2. 貼入以下內容：

```
OPENAI_API_KEY=你複製的金鑰貼在這裡
PORT=3000
```

例如：
```
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl...
PORT=3000
```

3. **儲存檔案**
   - 按 `Ctrl + S`
   - 檔名輸入：`.env`（要有點）
   - 檔案類型：選「所有檔案」
   - 位置：Claude_Project 資料夾

4. 檢查成功
   - 回到檔案管理員
   - 應該看到一個 `.env` 檔案（沒有副檔名）

✅ .env 檔案設定好後，繼續下一步

---

## 第 4 步：啟動後端伺服器

### 4.1 在 CMD 中啟動伺服器
確保 CMD 還在 Claude_Project 資料夾，輸入：

```
node server.js
```

### 4.2 檢查伺服器是否成功啟動
**預期結果：** 看到這樣的訊息：

```
╔════════════════════════════════════════╗
║     AI 文案生成器 - 後端伺服器      ║
║   ✅ 伺服器已啟動                      ║
║   🌐 網址：http://localhost:3000       ║
║   📝 API：http://localhost:3000/api/generate-copy ║
╚════════════════════════════════════════╝
```

**✅ 如果看到上面的訊息，表示伺服器成功啟動了！**

### 4.3 重要提醒
- **不要關閉這個 CMD 視窗**（關閉=伺服器停止）
- 需要再打開其他 CMD，請用新視窗

---

## 第 5 步：打開前端網頁

### 5.1 打開前端網頁
1. 回到檔案管理員，進入 Claude_Project
2. 找到 `ai-copywriter-backend.html`
3. **雙擊打開**（用瀏覽器打開）

### 5.2 檢查連接狀態
網頁上方應該顯示：
- ✅ 伺服器已連接（綠色）= 成功！
- ❌ 無法連接伺服器 = 檢查伺服器是否還在執行

### 5.3 開始使用
1. 選擇文案類型（IG、Reels、企劃等）
2. 填入需求
3. 選擇目標客群和語氣
4. 點「生成文案」

✅ 大功告成！

---

## 🔧 常見問題排查

### 問題 1：「node 不是內部或外部命令」
**解決：** 
- Node.js 沒有安裝
- 去 https://nodejs.org/ 下載 LTS 版本
- 安裝時勾選「Add Node.js to PATH」
- 重新啟動 CMD

### 問題 2：「找不到 package.json」
**解決：**
- 確認你在 Claude_Project 資料夾
- 用 `dir` 檢查檔案清單
- 如果沒有 package.json，說明檔案沒下載好，聯絡我

### 問題 3：「npm: 無法辨識」
**解決：**
- Node.js 沒裝好
- 重新裝 Node.js，記得選「Add npm to PATH」

### 問題 4：「OPENAI_API_KEY not found」
**解決：**
- .env 檔案沒建立好
- 檢查：
  - 檔名是否為 `.env`（有點）
  - 內容是否有 `OPENAI_API_KEY=sk-...`
  - 位置是否在 Claude_Project 資料夾
- 重新建立一次

### 問題 5：安裝時有紅色錯誤訊息
**解決：**
- 大多數是警告，可以忽略
- 只要最後看到 `added XX packages`，就代表成功

### 問題 6：網頁說「無法連接伺服器」
**解決：**
1. 檢查 CMD 視窗是否還顯示「✅ 伺服器已啟動」
2. 如果 CMD 黑屏或沒反應，說明伺服器已停止：
   - 關閉 CMD
   - 重新打開
   - 再次執行 `node server.js`
3. 等 5 秒後，重新整理網頁（按 F5）

---

## ⏸️ 暫停/重新啟動

### 暫停伺服器
在 CMD 中按 `Ctrl + C`
- 畫面會顯示 `^C`
- 伺服器停止

### 重新啟動伺服器
```
node server.js
```

---

## 🔐 安全提醒

1. **不要分享 .env 檔案**（裡面有 API Key）
2. **不要把 API Key 貼在程式碼裡**
3. **不要上傳 .env 到 GitHub**
4. **API Key 洩露要馬上撤銷**（去 https://platform.openai.com/account/api-keys 刪除）

---

## ✅ 完成檢查清單

使用前，確認以下都完成：

- [ ] Node.js 已安裝（`node --version` 有版本號）
- [ ] npm 已安裝（`npm --version` 有版本號）
- [ ] 在 Claude_Project 資料夾執行過 `npm install`
- [ ] 建立了 `.env` 檔案，裡面有 API Key
- [ ] 執行過 `node server.js`，看到綠色的「✅ 伺服器已啟動」訊息
- [ ] 打開 `ai-copywriter-backend.html`，看到「✅ 伺服器已連接」
- [ ] 成功生成了一份文案

---

## 下一步

✅ 後端伺服器已設定好，現在：

1. **第 1 週** - 用工具產出 5-10 份範例文案
2. **第 2 週** - 分享給朋友試用
3. **第 3 週** - 推廣給更多人
4. **第 4 週** - 啟動付費版本

詳見 `推廣策略.md`

---

## 需要幫助？

如果遇到問題，告訴我：
1. 具體的錯誤訊息是什麼？
2. 你在哪一步卡住？
3. 螢幕截圖（複製貼上）

我會幫你排查。
