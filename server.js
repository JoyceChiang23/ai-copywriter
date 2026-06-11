// AI 文案生成器 - 後端伺服器
// 使用 Node.js + Express + OpenAI API

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件設定
app.use(cors());
app.use(express.json());

// 提供靜態文件
app.use(express.static(path.join(__dirname, '.')));

// 根路由 - 提供主頁
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-online.html'));
});

// OpenAI 設定
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 路由：健康檢查
app.get('/health', (req, res) => {
  res.json({ status: '✅ 伺服器正常運行' });
});

// 路由：生成文案
app.post('/api/generate-copy', async (req, res) => {
  try {
    const {
      copyType,
      requirement,
      audience,
      tone,
      platform
    } = req.body;

    // 驗證必要欄位
    if (!copyType || !requirement || !audience || !tone) {
      return res.status(400).json({
        error: '❌ 缺少必要欄位：copyType、requirement、audience、tone'
      });
    }

    // 構建 AI Prompt
    const prompt = buildPrompt(copyType, requirement, audience, tone, platform);

    console.log('📝 生成請求：', copyType);
    console.log('⏱️ 時間：', new Date().toLocaleString('zh-TW'));

    // 調用 OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const generatedText = completion.data.choices[0].message.content;

    console.log('✅ 文案生成成功');

    res.json({
      success: true,
      copy: generatedText,
      copyType: copyType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 錯誤：', error.message);

    // 針對不同的錯誤類型給出提示
    if (error.message.includes('API key')) {
      return res.status(401).json({
        error: '❌ API Key 設定錯誤，請檢查 .env 文件'
      });
    }

    if (error.message.includes('quota')) {
      return res.status(429).json({
        error: '❌ API 額度已用完，請檢查 OpenAI 帳戶'
      });
    }

    res.status(500).json({
      error: `❌ 發生錯誤：${error.message}`
    });
  }
});

// Prompt 構建函數
function buildPrompt(copyType, requirement, audience, tone, platform) {
  const toneMap = {
    'professional': '專業正式的',
    'friendly': '溫暖親切的',
    'humorous': '幽默有趣的',
    'inspirational': '勵志鼓舞的',
    'casual': '隨興輕鬆的'
  };

  const audienceMap = {
    'young-women': '年輕女性（18-35 歲）',
    'professionals': '上班族/專業人士',
    'entrepreneurs': '創業者/小老闆',
    'home-lovers': '居家愛好者',
    'general': '一般大眾'
  };

  const copyTypeMap = {
    'ig-post': 'IG 貼文文案（80-150 字，要引發互動）',
    'reels-script': 'Reels 腳本（15-30 秒，要有故事轉折）',
    'stories': '限動文案（簡短、吸睛、要有 CTA）',
    'plan': '企劃書大綱（5 頁內容摘要）',
    'product-desc': `${platform} 平台的商品描述（重點特色、優勢、使用場景）`,
    'marketing-copy': '行銷文案（強調價值、解決痛點）'
  };

  return `你是一位專業的台灣行銷文案高手。

請根據以下需求，寫一份 ${toneMap[tone]} 的 ${copyTypeMap[copyType]}。

需求：${requirement}
目標客群：${audienceMap[audience]}

請用流暢的繁體中文，確保文案簡潔有力、容易記住。不要超過 3000 字。`;
}

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     AI 文案生成器 - 後端伺服器      ║
║   ✅ 伺服器已啟動                      ║
║   🌐 網址：http://localhost:${PORT}       ║
║   📝 API：http://localhost:${PORT}/api/generate-copy ║
╚════════════════════════════════════════╝
  `);
});

// 錯誤處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未處理的 Promise 拒絕：', reason);
});
