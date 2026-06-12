// AI 文案生成器 - 後端伺服器

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-online.html'));
});

app.get('/shopee', (req, res) => {
  res.sendFile(path.join(__dirname, 'shopee-seo.html'));
});

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const SYSTEM_PROMPT = `你是一位在台灣有實際操盤經驗的資深行銷文案人，寫過社群、電商、提案、短影音腳本。

【核心原則】
你只輸出可以直接使用的文案成品。不要寫任何說明、評語、建議、或助理式結尾。

【絕對禁止的句型和詞彙】
以下這些一律不可出現，出現就是不合格：
- 讓我們一起、一起來
- 為您帶來、為你帶來
- 享受生活的美好、享受美好生活
- 療癒身心、療癒心靈
- 提升生活品質、生活質感提升
- 不要錯過、千萬不要錯過
- 希望能符合您的需求
- 如需更多內容請告訴我
- 這份文案應該能夠
- 希望這份腳本
- 謝謝、感謝您
- 無限可能、無限幸福感
- 完美體驗、全新體驗
- 改變你的人生
- 輕鬆實現夢想
- 開啟美好生活
- 充滿正能量

【寫作要求】
- 必須繁體中文
- 文案要具體有畫面，每個句子都要有實際內容，不能只是空話
- 語氣要像真人寫的，不像廣告稿或 AI 生成
- 根據目標客群調整語感與深度
- 格式用【區塊名稱】標示，不要省略任何區塊
- 即使需求描述不足，仍要補出可用的完整版本

【最重要的一條】
輸出結束後，不要加任何說明、評語、或「希望這對你有幫助」之類的話。成品輸出完就結束。`;

app.get('/health', (req, res) => {
  res.json({ status: '✅ 伺服器正常運行' });
});

app.post('/api/generate-copy', async (req, res) => {
  try {
    const {
      copyType, requirement, audience, tone, platform,
      outputLength, purpose, ctaGoal, versions
    } = req.body;

    if (!copyType || !requirement || !audience || !tone) {
      return res.status(400).json({ error: '❌ 缺少必要欄位：copyType、requirement、audience、tone' });
    }

    const prompt = buildPrompt(copyType, requirement, audience, tone, platform, outputLength, purpose, ctaGoal, versions);
    const maxTokens = getTokenLimit(outputLength, versions);

    console.log(`📝 生成請求：${copyType} | 版本：${versions || 1} | 長度：${outputLength || 'standard'}`);
    console.log(`⏱️  ${new Date().toLocaleString('zh-TW')}`);

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt }
      ],
      temperature: 0.82,
      max_tokens: maxTokens
    });

    const generatedText = completion.data.choices[0].message.content;
    console.log('✅ 生成成功');

    res.json({ success: true, copy: generatedText, copyType, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('❌ 錯誤：', error.message);
    if (error.message.includes('API key')) {
      return res.status(401).json({ error: '❌ API Key 設定錯誤，請檢查 .env 檔案' });
    }
    if (error.message.includes('quota') || (error.response && error.response.status === 429)) {
      return res.status(429).json({ error: '❌ API 額度不足，請至 platform.openai.com 儲值' });
    }
    res.status(500).json({ error: `❌ 發生錯誤：${error.message}` });
  }
});

function getTokenLimit(outputLength, versions) {
  const base = { short: 1200, standard: 2400, detailed: 3200 }[outputLength] || 2400;
  const mult = { '3': 2.2, '5': 3.5 }[String(versions)] || 1;
  return Math.min(Math.round(base * mult), 4000);
}

function buildPrompt(copyType, requirement, audience, tone, platform, outputLength, purpose, ctaGoal, versions) {
  const toneMap = {
    professional:  '專業正式、條理清晰，用詞精準有份量',
    friendly:      '溫暖親切、像朋友說話，語氣輕鬆但有溫度',
    humorous:      '幽默有趣、帶梗，敢反差、敢自嘲，不尷尬',
    inspirational: '有行動力的鼓舞，要有具體場景，不要心靈雞湯',
    casual:        '隨興口語、接地氣，像在傳訊息給朋友'
  };

  const audienceMap = {
    'young-women':  '台灣年輕女性（18-35 歲）：重視質感生活、愛分享、容易被故事打動',
    professionals:  '台灣上班族 / 專業人士：重視效率、信賴感、有具體數據更好',
    entrepreneurs:  '台灣創業者 / 小老闆：在意 ROI、看重實用性、不喜歡廢話',
    'home-lovers':  '居家愛好者：喜歡空間改造、有生活美學感、對細節敏感',
    general:        '台灣一般大眾：直白易懂、貼近日常、不要太文青也不要太商業'
  };

  const lengthMap = {
    short:    '每個區塊精簡，控制在 2-3 句以內',
    standard: '適當展開每個區塊，不要過度精簡也不要冗長',
    detailed: '每個區塊充分展開，補充具體範例、場景、細節'
  };

  const purposeMap = {
    post:           '用於社群發文：語氣自然、有人味、容易被分享',
    ad:             '用於付費廣告：直接、有說服力、有轉換意圖',
    presentation:   '用於簡報提案：語氣正式、結構清晰、邏輯嚴謹',
    'product-page': '用於商品頁：詳細、有說服力、符合平台購物習慣',
    'dm-sales':     '用於私訊銷售：親切自然、一對一感、不要過度推銷'
  };

  const ctaMap = {
    comment:      'CTA 方向：引導讀者留言互動',
    dm:           'CTA 方向：引導讀者私訊詢問',
    link:         'CTA 方向：引導讀者點擊連結',
    order:        'CTA 方向：引導直接下單購買',
    consultation: 'CTA 方向：引導預約諮詢'
  };

  const platformMap = {
    shopee:          '蝦皮購物（標題塞關鍵字、多用表情符號、CTA 用「加購」「馬上搶」「限時優惠」）',
    momo:            'momo 購物網（強調品牌信賴、主打優惠與保障、CTA 用「立即訂購」「加入購物車」）',
    pchome:          'PChome（語氣理性，著重規格比較、附配件、售後，CTA 用「立即購買」）',
    'shopee-global': 'Shopee 國際版（語氣親切友善，避免台灣俗語，CTA 用 Add to Cart / Buy Now）',
    'custom-site':   '自建官網（品牌感優先，語氣可有個性，CTA 可客製化如「預訂」「加入等候名單」）'
  };

  const vNum = parseInt(versions) || 1;
  const versionNote = vNum > 1
    ? `\n\n⚠️ 請產生 ${vNum} 個完整版本，每個版本前加「===== 版本 1 =====」「===== 版本 2 =====」等標題。版本之間的切角、語感、開場方式要有明顯差異，不是只換幾個字。`
    : '';

  const ctx = [
    `需求：${requirement}`,
    `目標客群：${audienceMap[audience] || audience}`,
    `語氣：${toneMap[tone] || tone}`,
    outputLength ? `長度要求：${lengthMap[outputLength]}` : '',
    purpose      ? `使用目的：${purposeMap[purpose] || purpose}` : '',
    ctaGoal      ? ctaMap[ctaGoal] || '' : '',
    (platform && (copyType === 'product-desc' || copyType === 'marketing-copy'))
      ? `販售平台：${platformMap[platform] || platform}` : ''
  ].filter(Boolean).join('\n');

  const templates = {

    'ig-post': `根據以下資訊，生成一篇 IG 貼文文案。

${ctx}${versionNote}

【強制要求】
- 開頭要像真人的生活紀錄或小劇場，不是廣告開場
- 正文要有節奏：短句、換行、反差、可以有內心 OS
- 不要寫得像品牌公告或心靈雞湯
- Hashtags 要精準、符合台灣 IG 現況，不要用過時或太泛的標籤
- 輸出完成品，不要在最後加說明或評語

依照以下格式輸出，每個【區塊】都要有：

【爆款開頭】
（前兩行要讓人停止滑動。用場景、數字、反問、或內心 OS。禁止從「今天」「最近」「分享給大家」開始）

【正文】
（分段寫，每段 1-3 句，可用句號換行製造節奏。要有具體細節，不要只寫感受）

【互動問題】
（問一個讀者真的會想回答的問題，不要問「你覺得如何呢？」）

【CTA】
（具體行動呼籲）

【Hashtags】
（12-15 個，混合精準小眾 + 熱門台灣標籤）

【3 個備用開頭】
1.
2.
3.`,

    'reels-script': `根據以下資訊，生成一支 Reels 影片腳本。

${ctx}${versionNote}

【強制要求】
- 前 3 秒必須是強鉤子，要製造懸念、衝突、或反差，不可以只是描述情況
- 旁白要短句，每句不超過 10 個字，要有節奏感，像真人說話
- 每 3-5 秒要有一個新的畫面或動作
- 腳本只寫內容，結尾不加「這支腳本應該能夠……」之類的評語
- 輸出完成品，不要在最後加說明

依照以下格式輸出：

【影片主題】
（一句話，說清楚這支影片的核心切角）

【觀眾痛點 / 情緒鉤子】
（這支影片觸發觀眾的是什麼：好奇心、共鳴感、衝突感、還是資訊需求）

【30 秒分鏡腳本】
| 時間 | 畫面／動作 | 旁白／字幕（短句，10字以內） | 音效／轉場 |
|------|-----------|---------------------------|-----------|
| 0-3秒（強鉤子） | | | |
| 4-7秒 | | | |
| 8-13秒 | | | |
| 14-20秒 | | | |
| 21-26秒 | | | |
| 27-30秒（CTA） | | | |

【結尾 CTA】
（具體一句話行動呼籲）

【3 組備用開場鉤子】
（前 3 秒的替換版本，每組一行旁白 + 對應畫面）
1. 畫面： / 旁白：
2. 畫面： / 旁白：
3. 畫面： / 旁白：`,

    'stories': `根據以下資訊，生成一組 IG 限動文案（3 則）。

${ctx}${versionNote}

【強制要求】
- 每一則限動只有 1-3 行短句，像真人發限動，不是品牌公告
- 不要寫成條列說明或企劃文字
- 每則文字要可以直接貼上限動使用
- 語氣要像真人發出來的，有情緒、有生活感
- 貼紙建議另外標在文字下方
- 輸出完成品，不要在最後加說明

依照以下格式輸出：

【第 1 則：互動開場】
（可直接貼上的文字，1-3 行）
建議貼紙：

【第 2 則：內容主體】
（可直接貼上的文字，1-3 行）
建議貼紙：

【第 3 則：CTA】
（可直接貼上的文字，1-3 行）
建議貼紙：`,

    'plan': `根據以下資訊，生成一份商務企劃書。

${ctx}${versionNote}

【強制要求】
- 這是商務企劃書，不是作文，用條列式和表格，不要長篇段落
- 每個區塊都要有具體內容，不能只列標題
- 三階段時程要包含：週期、核心任務、交付成果
- 風險與解法至少 3 組
- 預期效益要可衡量（數字、百分比、時間範圍）
- 簡報大綱每頁要有：頁面主題、核心訊息、建議放的圖表或視覺
- 輸出完成品，不要在最後加說明

依照以下格式輸出：

【企劃名稱】

【專案背景】
（2-3 句，說明為什麼現在需要做這個）

【現況痛點】
• 痛點一：（具體描述，有數據更好）
• 痛點二：
• 痛點三：

【專案目標（KPI）】
• 目標一：（可量化，例如：3 個月內增加 30% 自然流量）
• 目標二：
• 目標三：

【執行策略】
策略一：（標題）
→ 具體做法：

策略二：（標題）
→ 具體做法：

策略三：（標題）
→ 具體做法：

【三階段時程表】
| 階段 | 週期 | 核心任務 | 交付成果 |
|------|------|---------|---------|
| 第一階段：（命名） | 第 X-X 週 | | |
| 第二階段：（命名） | 第 X-X 週 | | |
| 第三階段：（命名） | 第 X-X 週 | | |

【預期效益】
量化效益：
• （有數字，有時間範圍）

質化效益：
• （品牌感知、用戶體驗等可描述的改善）

【風險與解法】
| 風險項目 | 可能影響 | 應對方式 |
|---------|---------|---------|
| 風險一 | | |
| 風險二 | | |
| 風險三 | | |

【簡報頁面大綱】
第 1 頁｜封面
核心訊息：企劃名稱、提案單位、日期
建議視覺：品牌主視覺 + 一句 tagline

第 2 頁｜現況與痛點
核心訊息：用數據說明為什麼要做
建議視覺：痛點對比圖 or 現況數據圖

第 3 頁｜解決方案
核心訊息：我們的策略是什麼
建議視覺：策略流程圖 or 三欄對比

第 4 頁｜執行時程
核心訊息：什麼時候做什麼
建議視覺：甘特圖 or 時間軸

第 5 頁｜預期效益
核心訊息：做了之後會有什麼結果
建議視覺：KPI 達成圖 or before/after 對比`,

    'product-desc': `根據以下資訊，生成一份電商商品描述。

${ctx}${versionNote}

【強制要求】
- 情境式開場要有具體畫面，讓目標客群感覺「就是在說我」，不要空泛形容詞
- 核心賣點要條列清楚，說效益不只說功能
- CTA 要依平台調整（蝦皮用「加購」「搶先」，官網可用品牌感語句）
- 輸出完成品，不要在最後加說明

依照以下格式輸出：

【商品主標】
（有關鍵字、有吸引力，蝦皮要塞搜尋字，官網可有品牌感）

【商品副標】
（一句話補充最核心的差異點）

【情境式開場】
（2-3 句，用具體生活場景帶入。例如：「早上趕著出門，找不到那件……」而不是「本商品品質優良」）

【核心賣點】
✦ 賣點一：（功能 → 帶來什麼效益）
✦ 賣點二：
✦ 賣點三：
（視商品增加至 5 個）

【商品規格】
（條列式，清楚）

【適合對象】
（具體描述，用生活場景，不要只說「適合所有人」）

【使用情境】
（1-2 個具體場景，讓人有畫面）

【CTA】
（根據販售平台調整語氣，不要每次都用「現在就選購」）`,

    'marketing-copy': `根據以下資訊，生成一份行銷文案。

${ctx}${versionNote}

【強制要求】
- 主標要有力、具體，說出最大價值，不要口號式空話
- 情境式文案要讓目標客群有代入感
- 活動亮點要說清楚是什麼，不要只說「超值」「划算」
- 短版和長版都要完整輸出
- 輸出完成品，不要在最後加說明

依照以下格式輸出：

【主標】
（一句話說出最大價值，有力且具體）

【活動亮點】
• 亮點一：（具體說清楚）
• 亮點二：
• 亮點三：

【情境式文案】
（讓目標客群有代入感的場景，2-3 段，分段換行）

【適合對象】
（具體描述，用生活場景說明誰最需要這個）

【活動資訊】
時間：
地點 / 方式：
價格 / 優惠：
限制條件（如有）：

【CTA】
（有行動感，依 CTA 目的調整）

【短版（50 字以內）】

【長版（150-300 字）】`
  };

  return templates[copyType] || `根據以下資訊，生成一份文案成品：\n\n${ctx}${versionNote}\n\n用繁體中文，語氣要像真人寫的，輸出可直接使用的成品。`;
}

// ---- 蝦皮 SEO API ----

const SHOPEE_SYSTEM_PROMPT = `你是台灣蝦皮電商 SEO 顧問，專門協助賣家優化商品標題與上架資訊。

規則：
1. 必須使用繁體中文，用台灣電商語感，不用大陸用語
2. 目標是協助賣家整理商品上架內容，不保證排名或銷量
3. 標題要兼顧搜尋關鍵字與買家理解，不要只堆疊關鍵字
4. 若有競品標題，只可參考關鍵字方向與結構，絕不逐字抄襲
5. 嚴格禁用以下字眼：第一名、全台最便宜、保證有效、100%有效、神奇效果、必買、秒殺全網、官方唯一、絕對保證、限時搶購、銷量冠軍
6. 如果使用者提供「想避開的詞」，這些詞必須完全不出現在任何輸出中，包含標題、關鍵字、描述、標籤
7. 商品規格、適用對象、使用情境必須優先整合進標題與商品描述
8. 5 組標題必須方向截然不同，不能只是換字或調換順序
9. 商品描述開頭必須先講買家最在意的好處，不要先說商品名稱
10. 如果有提供原始商品標題，必須先完整分析其問題，再產出優化版本
11. 輸出完成品，不加助理式客套話，不自我評價，不說「希望符合您的需求」、「如需更多協助請告訴我」、「謝謝」`;

app.post('/api/shopee-seo', async (req, res) => {
  try {
    const { productName, originalTitle, category, customCategory, productFeatures, specs, targetAudience, useCase, competitorTitles, avoidWords } = req.body;
    const effectiveCategory = (customCategory && customCategory.trim()) ? customCategory.trim() : category;

    if (!productName || !productFeatures || !effectiveCategory) {
      return res.status(400).json({ error: '❌ 請填寫商品名稱、商品類別和商品特色' });
    }

    const prompt = buildShopeePrompt(productName, effectiveCategory, productFeatures, specs, targetAudience, useCase, competitorTitles, avoidWords, originalTitle);
    console.log(`🛒 蝦皮 SEO 請求：${productName} | 類別：${effectiveCategory} | 原始標題：${originalTitle ? '有' : '無'}`);

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SHOPEE_SYSTEM_PROMPT },
        { role: 'user',   content: prompt }
      ],
      temperature: 0.72,
      max_tokens: 3500
    });

    const result = completion.data.choices[0].message.content;
    console.log('✅ 蝦皮 SEO 生成成功');

    res.json({ success: true, result, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('❌ 蝦皮 SEO 錯誤：', error.message);
    if (error.message.includes('API key')) return res.status(401).json({ error: '❌ API Key 錯誤' });
    if (error.message.includes('quota') || (error.response && error.response.status === 429)) {
      return res.status(429).json({ error: '❌ API 額度不足，請儲值' });
    }
    res.status(500).json({ error: `❌ 發生錯誤：${error.message}` });
  }
});

function buildShopeePrompt(productName, category, productFeatures, specs, targetAudience, useCase, competitorTitles, avoidWords, originalTitle) {
  const ctx = [
    `商品名稱：${productName}`,
    `商品類別：${category}`,
    `商品特色/賣點：${productFeatures}`,
    specs            ? `商品規格：${specs}` : '',
    targetAudience   ? `適用對象：${targetAudience}` : '',
    useCase          ? `使用情境：${useCase}` : '',
    originalTitle    ? `原始商品標題（賣家現有標題，需先分析問題再優化）：${originalTitle}` : '',
    competitorTitles ? `競品標題參考（只分析關鍵字結構與方向，不得逐字抄襲）：\n${competitorTitles}` : '',
    avoidWords       ? `⚠️ 絕對禁止出現的詞（標題、關鍵字、描述、標籤全部適用）：${avoidWords}` : ''
  ].filter(Boolean).join('\n');

  const module0Block = originalTitle ? `【模組零：原始標題問題分析】

原始標題：${originalTitle}

問題列表：
• （問題一：具體說明哪個部分有問題）
• （問題二）
• （問題三）
• （問題四，至少列出 4 個問題）

優化方向：
• （對應問題一的改善建議）
• （對應問題二的改善建議）
• （對應問題三的改善建議）
• （對應問題四的改善建議）

對照表：
原始標題問題 | 建議優化方式 | 原因
（問題一）|（具體改善方式）|（原因說明）
（問題二）|（具體改善方式）|（原因說明）
（問題三）|（具體改善方式）|（原因說明）
（問題四）|（具體改善方式）|（原因說明）

` : '';

  return `${ctx}

請依照以下格式輸出全部模組，不得省略任何區塊，不加說明或評語：

${module0Block}【模組一：5 組蝦皮 SEO 標題】

--- 標題 1 · 高搜尋曝光版 ---
標題：（品類詞＋規格詞＋常見搜尋詞，關鍵字完整覆蓋，100 字以內）
適合用途：新品上架初期，追求搜尋曝光量
關鍵字類型：（說明用了哪些類型的詞）
優點說明：（一句話說明這組標題的優勢）

--- 標題 2 · 高點擊吸引版 ---
標題：（讓買家一眼看懂用途與好處，方向明顯不同於標題 1）
適合用途：有一定曝光後，追求提升點擊率
關鍵字類型：
優點說明：

--- 標題 3 · 高轉換銷售版 ---
標題：（強調痛點解決、購買理由、實用性，方向明顯不同於前兩組）
適合用途：已有流量時，提升轉換率
關鍵字類型：
優點說明：

--- 標題 4 · 簡潔質感版 ---
標題：（不過度堆疊，讓標題有品牌感，風格截然不同）
適合用途：走質感路線的賣家
關鍵字類型：
優點說明：

--- 標題 5 · 長尾關鍵字版 ---
標題：（含情境詞、族群詞、細分需求詞）
適合用途：鎖定細分族群，提升精準轉換
關鍵字類型：
優點說明：

【模組二：關鍵字分類】

核心關鍵字：（逗號分隔，6-8 個）
長尾關鍵字：（逗號分隔，6-8 個）
使用情境關鍵字：（逗號分隔，4-6 個）
目標族群關鍵字：（逗號分隔，4-6 個）
規格/材質關鍵字：（逗號分隔，4-6 個）

【模組三：商品描述】

開場三行賣點：
• （第一行，買家最在意的核心好處，不要先說商品名稱）
• （第二行）
• （第三行）

商品特色：
• （條列，每項一行）

使用情境：（2-3 句具體場景）

適合對象：（具體描述）

商品規格：（條列整理）

下單 CTA：（1-2 句，蝦皮電商語氣，不誇大，不違規）

【模組四：建議標籤】

（10-20 個，逗號分隔，只放與商品真正相關的詞，不塞無關熱門詞）

【模組五：A/B 測試建議】

建議測試 A：（引用上方其中一組標題文字）
建議測試 B：（引用上方其中一組標題文字）
測試原因：（為什麼選這兩組，它們的方向有什麼不同）
觀察指標：曝光數、點擊率（CTR）、收藏數、轉換率

【模組六：SEO 檢查清單】

✅ 或 ❌ 包含商品品類詞：（說明）
✅ 或 ❌ 包含主要規格詞：（說明）
✅ 或 ❌ 包含使用情境詞：（說明）
✅ 或 ❌ 包含目標族群詞：（說明）
✅ 或 ❌ 避免過度堆疊關鍵字：（說明）
✅ 或 ❌ 避免誇大或違規詞：（說明）
✅ 或 ❌ 3 秒內讓買家看懂商品用途：（說明）`;
}

// ---- 啟動 ----

app.listen(PORT, () => {
  console.log(`✅ AI 文案生成器啟動 → http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未處理的錯誤：', reason);
});
