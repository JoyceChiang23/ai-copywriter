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

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const SYSTEM_PROMPT = `你是一位專業的台灣行銷文案策略師，擅長撰寫社群媒體、電商、企劃提案等各類文案。

嚴格遵守以下規則：
- 必須使用繁體中文
- 文案要具體、有畫面、有對象感，避免模糊描述
- 嚴格禁用以下罐頭句：「讓我們一起」「開啟美好生活」「帶來無限幸福感」「絕對不要錯過」「享受生活美好」「充滿正能量」「完美體驗」「全新體驗」「改變你的人生」「輕鬆實現夢想」
- 每次根據文案類型輸出完整對應格式，不得省略任何區塊標題
- 即使使用者需求描述不足，也要根據現有資訊補出可用版本，不要只反問使用者
- 文字要像真人口吻，不要像廣告模板或機器生成
- 根據目標客群調整用詞深度與語感`;

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
      temperature: 0.78,
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
    professional:  '專業正式、條理清晰',
    friendly:      '溫暖親切、像朋友說話',
    humorous:      '幽默有趣、輕鬆帶梗',
    inspirational: '鼓舞人心、有行動力',
    casual:        '隨興輕鬆、接地氣'
  };

  const audienceMap = {
    'young-women':  '年輕女性（18-35 歲），注重生活質感、喜歡社群分享',
    professionals:  '上班族 / 專業人士，重視效率與可信度',
    entrepreneurs:  '創業者 / 小老闆，在意 ROI 與實際效益',
    'home-lovers':  '居家愛好者，喜歡空間改造與生活美學',
    general:        '一般大眾，用語要直白易懂'
  };

  const lengthMap = {
    short:    '輸出簡潔版，每個區塊控制在 2-3 句以內',
    standard: '輸出標準版，適當展開每個區塊',
    detailed: '輸出詳細版，每個區塊充分展開，提供具體範例與說明'
  };

  const purposeMap = {
    post:           '用於社群發文，語氣自然、容易被分享',
    ad:             '用於付費廣告，要直接有說服力、有緊迫感',
    presentation:   '用於簡報提案，語氣正式、結構清晰',
    'product-page': '用於商品頁，要詳細且有說服力',
    'dm-sales':     '用於私訊銷售，語氣親切、像真人一對一溝通'
  };

  const ctaMap = {
    comment:      '引導讀者留言互動',
    dm:           '引導讀者私訊詢問',
    link:         '引導讀者點擊連結',
    order:        '引導直接下單購買',
    consultation: '引導預約諮詢'
  };

  const platformMap = {
    shopee:          '蝦皮購物（語氣活潑、多用表情符號、標題要有搜尋關鍵字）',
    momo:            'momo 購物網（強調品質保證與優惠活動，信賴感要強）',
    pchome:          'PChome（語氣理性、著重規格比較與實用性）',
    'shopee-global': 'Shopee 國際版（語氣親切、注意跨文化接受度）',
    'custom-site':   '自建官網（品牌個性可更鮮明，語氣有彈性）'
  };

  const vNum = parseInt(versions) || 1;
  const versionNote = vNum > 1
    ? `\n\n【重要】請產生 ${vNum} 個風格不同的完整版本。每個版本前加上「===== 版本 1 =====」「===== 版本 2 =====」等標題，版本之間風格、切角、用詞要有明顯差異。`
    : '';

  const ctx = [
    `需求描述：${requirement}`,
    `目標客群：${audienceMap[audience] || audience}`,
    `語氣風格：${toneMap[tone] || tone}`,
    outputLength ? `輸出長度：${lengthMap[outputLength]}` : '',
    purpose     ? `使用目的：${purposeMap[purpose] || purpose}` : '',
    ctaGoal     ? `CTA 目的：${ctaMap[ctaGoal] || ctaGoal}` : '',
    (platform && (copyType === 'product-desc' || copyType === 'marketing-copy'))
      ? `販售平台：${platformMap[platform] || platform}` : ''
  ].filter(Boolean).join('\n');

  const templates = {

    'ig-post': `請根據以下資訊，生成一篇 IG 貼文文案：

${ctx}${versionNote}

請依照以下格式輸出，每個區塊標題用【】標示，不要省略任何區塊：

【爆款開頭】
（前兩行要讓人停止滑動。用具體場景、數字或反問，禁用空泛形容詞）

【正文】
（主要內容，分段書寫，每段 2-3 句，要有故事性或實用資訊量）

【互動問題】
（一個能讓讀者想留言回應的具體問題，不要問「你覺得呢？」這種廢問題）

【CTA】
（具體行動呼籲，根據 CTA 目的撰寫）

【Hashtags】
（12-15 個，混合精準小眾標籤 + 熱門大眾標籤）

【3 個備用標題】
1.
2.
3. `,

    'reels-script': `請根據以下資訊，生成一支 Reels 影片腳本：

${ctx}${versionNote}

請依照以下格式輸出，每個區塊標題用【】標示，不要省略任何區塊：

【影片主題】
（一句話說明影片核心，要有具體切角）

【目標痛點 / 情緒觸發點】
（這支影片要觸發觀眾什麼感受，或解決什麼問題）

【30 秒分鏡腳本】
| 時間 | 畫面 | 旁白 / 螢幕字幕 | 音效 / 轉場 |
|------|------|----------------|------------|
| 0-3秒（鉤子） | | | |
| 4-10秒 | | | |
| 11-20秒 | | | |
| 21-27秒 | | | |
| 28-30秒（CTA） | | | |

【CTA 文字】
（結尾的具體行動呼籲）

【3 組備用開場鉤子】
1.
2.
3. `,

    'stories': `請根據以下資訊，生成一組 IG 限動文案（3 則連貫）：

${ctx}${versionNote}

請依照以下格式輸出，每個區塊標題用【】標示，不要省略任何區塊：

【第 1 則：互動開場】
文案內容：
建議貼紙：（說明投票／問答貼紙的具體選項設定）

【第 2 則：內容鋪陳】
文案內容：
建議貼紙：（說明問答／測驗貼紙的具體設定）

【第 3 則：CTA】
文案內容：
建議貼紙：（說明連結貼紙或滑動上去的文字設定）`,

    'plan': `請根據以下資訊，生成一份企劃書：

${ctx}${versionNote}

請依照以下格式輸出。這是商務企劃書，不是作文，請用條列式與表格，不要長篇敘述。每個區塊標題用【】標示，不要省略：

【企劃名稱】

【專案背景】
（2-3 句說明為什麼需要這個專案）

【現況痛點】
（條列 3-5 個具體問題，用數據或事實支撐）

【專案目標】
（條列可量化的 KPI，例如：觸及人數、轉換率、營收目標）

【執行策略】
（分 3-4 個方向，每個方向說明具體做法）

【三階段時程表】
| 階段 | 時間 | 核心任務 | 預期成果 |
|------|------|---------|---------|
| 第一階段 | | | |
| 第二階段 | | | |
| 第三階段 | | | |

【預期效益】
量化效益：
質化效益：

【風險與解法】
| 風險項目 | 可能影響 | 應對方式 |
|---------|---------|---------|

【簡報頁面大綱】
第 1 頁：封面（企劃名稱、副標、提案單位）
第 2 頁：
第 3 頁：
第 4 頁：
第 5 頁：
（視需求補充更多頁）`,

    'product-desc': `請根據以下資訊，生成一份電商商品描述：

${ctx}${versionNote}

請依照以下格式輸出，每個區塊標題用【】標示，不要省略任何區塊：

【商品主標】
（有關鍵字、有吸引力，適合平台 SEO）

【商品副標】
（補充主標，說明最核心的一個優勢）

【情境式開場】
（2-3 句，讓目標客群看了有代入感，用具體生活場景，不要用空泛形容詞）

【核心賣點】
✦ 賣點一：（說明效益，不只說功能）
✦ 賣點二：
✦ 賣點三：
（視商品可增加至 5 個）

【商品規格】
（條列式，清楚明瞭）

【適合對象】
（具體描述，例如：每天需要久站的服務業員工、有收納困擾的小坪數住戶）

【使用情境】
（1-2 個具體場景，讓人有畫面）

【CTA】
（根據平台風格撰寫，帶動下單）`,

    'marketing-copy': `請根據以下資訊，生成一份行銷文案：

${ctx}${versionNote}

請依照以下格式輸出，每個區塊標題用【】標示，不要省略任何區塊：

【主標】
（一句話說出最大價值，有力、具體，不要口號式空話）

【活動亮點】
（條列 3-4 個具體亮點，說清楚是什麼，不要只說「超值」「划算」）

【情境式文案】
（讓目標客群有代入感的場景描述，2-3 段）

【適合對象】
（具體描述誰最需要這個，用生活場景說明）

【活動資訊】
時間：
地點 / 方式：
價格 / 優惠：
限制條件（如有）：

【CTA】
（根據 CTA 目的撰寫，要有行動感與急迫性）

【短版（50 字以內）】

【長版（150-300 字）】`
  };

  return templates[copyType] || `請根據以下資訊，生成一份文案：\n\n${ctx}${versionNote}\n\n請使用繁體中文，用具體有畫面的方式撰寫。`;
}

app.listen(PORT, () => {
  console.log(`✅ AI 文案生成器啟動 → http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未處理的錯誤：', reason);
});
