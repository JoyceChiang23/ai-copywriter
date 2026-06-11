# AI 文案生成器 - Render 部署指南（完全免費）

## 🎯 目標
把 AI 文案生成器部署到雲端（Render），讓朋友隨時隨地都能使用，不受時間、地點限制。

## ✨ 部署後的優勢

- ✅ **永遠在線** - 24/7 運行，不用開電腦
- ✅ **完全免費** - Render 免費方案足夠用
- ✅ **隨時可用** - 朋友可以隨時試用
- ✅ **看起來專業** - URL 是 `https://xxx.onrender.com`，不是 `localhost`
- ✅ **全世界可用** - 不限台灣本地

---

## 📋 部署步驟（按順序做，5 分鐘完成）

### 第 1 步：建立 GitHub 帳號（如果沒有）

**為什麼需要 GitHub？** Render 需要連結 GitHub 來部署程式碼

#### 1.1 去 GitHub 註冊
1. 打開瀏覽器，去 https://github.com
2. 點「Sign up」
3. 填寫：
   - 信箱：用你常用的 Gmail
   - 密碼：設一個強密碼
   - Username：可以用 `joyce-copywriter` 或你喜歡的名字
4. 完成驗證

#### 1.2 登入
確認你已經登入 GitHub

---

### 第 2 步：建立新的 GitHub Repository

#### 2.1 建立 Repo
1. 在 GitHub 首頁，點右上角的 `+` 按鈕
2. 選「New repository」
3. 填寫：
   - Repository name：`ai-copywriter`
   - Description：`AI 企劃文案生成器`
   - Public（選這個，讓 Render 能讀取）
   - 勾選「Add a README file」
4. 點「Create repository」

#### 2.2 檢查完成
你應該看到一個新的空 Repo，URL 像這樣：
```
https://github.com/你的username/ai-copywriter
```

✅ 記住這個 URL，等下會用到

---

### 第 3 步：上傳程式碼到 GitHub

#### 3.1 安裝 Git（如果沒有）

1. 打開瀏覽器，去 https://git-scm.com/download/win
2. 下載並安裝（一直點 Next 就好）
3. 安裝完後重新啟動電腦

#### 3.2 檢查 Git 是否安裝好
1. 打開 CMD
2. 輸入：`git --version`
3. 應該看到版本號（如 `git version 2.40.0`）

✅ 如果看到版本號，表示 Git 安裝成功

#### 3.3 上傳程式碼到 GitHub

1. 打開 CMD，進入 Claude_Project 資料夾
   ```
   cd C:\Users\Huan\Desktop\Claude_Project
   ```

2. 初始化 Git
   ```
   git init
   ```
   你現在正在做這一步 ✅

3. 設定你的 Git 身份（用你的 GitHub 帳號資訊）
   ```
   git config user.name "你的GitHub username"
   git config user.email "你的Gmail信箱"
   ```

4. 把所有檔案加入版本控制
   ```
   git add .
   ```

5. 建立第一個 Commit（存檔）
   ```
   git commit -m "初始提交：AI 文案生成器"
   ```

6. 連結遠端 Repository（把本地連到 GitHub）
   ```
   git remote add origin https://github.com/你的username/ai-copywriter.git
   ```

7. 上傳到 GitHub
   ```
   git branch -M main
   git push -u origin main
   ```

   **首次可能要登入 GitHub：**
   - 如果跳出登入視窗，用你的 GitHub 帳號密碼登入
   - 如果要求 Personal Access Token（PAT），去 https://github.com/settings/tokens 建立一個，然後貼上

8. 檢查完成
   - 去 GitHub 重新整理頁面
   - 應該看到你的程式碼被上傳了 ✅

---

### 第 4 步：在 Render 建立帳號

1. 打開瀏覽器，去 https://render.com
2. 點「Sign up」
3. 選「Continue with GitHub」
4. 授權 Render 存取你的 GitHub

✅ 帳號建立完成

---

### 第 5 步：在 Render 部署伺服器

#### 5.1 建立新的 Web Service

1. 進入 Render Dashboard（https://dashboard.render.com）
2. 點「New +」按鈕
3. 選「Web Service」

#### 5.2 連結 GitHub Repository

1. 在「Connect a repository」部分，找到你剛上傳的 `ai-copywriter` Repo
2. 點「Connect」

（如果沒看到 Repo，點「Configure account」授權更多權限）

#### 5.3 填寫部署設定

| 欄位 | 填什麼 |
|-----|------|
| Name | `ai-copywriter` 或任意名稱 |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Region | `Singapore`（東南亞最快） |
| Plan | `Free`（免費方案） |

#### 5.4 設定環境變數

這是最重要的一步！需要把 `.env` 檔案的內容設定到 Render。

1. 在部署頁面，找「Environment」部分
2. 點「Add Environment Variable」
3. 填寫：
   - Key：`OPENAI_API_KEY`
   - Value：你的 OpenAI API Key（以 `sk-` 開頭）
4. 點「Save」

#### 5.5 開始部署

1. 點「Create Web Service」
2. 等待部署完成（通常 2-3 分鐘）

**看到以下畫面 = 部署成功：**
```
✓ Build succeeded
✓ Deploy succeeded
```

#### 5.6 獲取你的公開 URL

部署完成後，Render 會給你一個 URL，像這樣：
```
https://ai-copywriter-xxxxx.onrender.com
```

✅ **這就是你的永久網址！** 

---

## 🌐 使用新的線上版本

### 方法 1：直接進入網站
1. 把下面的 URL 改成你的 URL
   ```
   https://ai-copywriter-xxxxx.onrender.com
   ```
2. 用瀏覽器打開
3. 應該看到「✅ 伺服器已連接」

### 方法 2：下載修改後的 HTML 檔案
1. 我會給你一個新的 HTML 檔案，裡面已經把 URL 改好了
2. 雙擊打開就能用

---

## 📤 推廣時怎麼分享

現在你可以這樣推廣：

### 推廣文案 1（最簡單）
```
我新做了一個 AI 文案工具
IG 文案、Reels、企劃書、商品描述都能生成

免費試用，點這裡：
[你的 URL]
```

### 推廣文案 2（更詳細）
```
厭倦寫文案？5 分鐘用 AI 產出專業文案 ✨

🖊️ IG 貼文
🎬 Reels 腳本
📋 企劃書
🛍️ 商品描述
📢 行銷文案

全都免費試用，隨時隨地都能用
👉 [你的 URL]
```

---

## 🔧 常見問題

### Q1：頁面顯示「無法連接伺服器」
**原因：** Render 免費方案會在 15 分鐘無人使用時「暫停」
**解決：**
- 等 30 秒，Render 會自動喚醒
- 重新整理頁面（按 F5）

### Q2：API Key 會不會洩露？
**不會。** 
- API Key 存在 Render 的環境變數中（加密）
- 朋友看不到你的 API Key
- 完全安全

### Q3：有無限制制嗎？
**免費方案的限制：**
- 1 個 Web Service（夠用）
- 650 小時/月（24 小時 × 27 天，夠用）
- 無限 API 請求（不限生成文案數量）

**結論：** 完全夠用

### Q4：怎麼更新程式碼？
1. 在本地改 code
2. 執行：
   ```
   git add .
   git commit -m "更新說明"
   git push
   ```
3. Render 會自動重新部署

### Q5：我想用自己的網域名？
暫時不需要。等到有真實收入再考慮。

---

## ✅ 完成檢查清單

部署前確認：
- [ ] 建立了 GitHub 帳號
- [ ] 建立了 GitHub Repository（ai-copywriter）
- [ ] 程式碼已上傳到 GitHub
- [ ] 建立了 Render 帳號
- [ ] 在 Render 建立了 Web Service
- [ ] 設定了 OPENAI_API_KEY 環境變數
- [ ] 部署完成（看到綠色的成功訊息）
- [ ] 有了公開 URL（https://xxx.onrender.com）
- [ ] 能打開 URL 並看到「✅ 伺服器已連接」

---

## 🎯 部署完成後的下一步

✅ 伺服器已上線，現在：

1. **馬上分享給朋友試用**
   - 傳 URL 給 5-10 位信任的朋友
   - 收集反饋

2. **根據反饋改進**
   - 如果朋友說「文案不夠 XXX」
   - 我幫你改 Prompt，自動更新到線上

3. **準備第 3 週推廣**
   - 把改進後的工具分享到 IG、朋友圈
   - 目標：100-300 個免費用戶

4. **第 4 週收費**
   - 設定簡單的付費機制
   - 預期：1-3 個付費用戶

詳見 `推廣策略.md`

---

## 🆘 遇到問題？

如果卡住，告訴我：
1. 你卡在哪一步？
2. 具體的錯誤訊息是什麼？
3. 螢幕截圖

我會幫你排查。

---

**現在繼續做下一步吧！** 你已經完成 `git init` 了，接下來是設定 Git 身份。🚀
