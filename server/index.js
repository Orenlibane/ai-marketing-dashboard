const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, 'public')));

// Get all marketing tools
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await prisma.marketingTool.findMany({
      orderBy: [
        { category: 'asc' },
        { usageScore: 'desc' }
      ]
    });
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Get tools by category
app.get('/api/tools/category/:category', async (req, res) => {
  try {
    const tools = await prisma.marketingTool.findMany({
      where: { category: req.params.category },
      orderBy: { usageScore: 'desc' }
    });
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools by category:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalTools = await prisma.marketingTool.count();
    const newLaunches = await prisma.marketingTool.count({
      where: { isNewLaunch: true }
    });
    const avgScore = await prisma.marketingTool.aggregate({
      _avg: { usageScore: true }
    });
    const categories = await prisma.marketingTool.groupBy({
      by: ['category'],
      _count: true
    });

    res.json({
      totalTools,
      newLaunches,
      avgScore: Math.round(avgScore._avg.usageScore || 0),
      categoryCount: categories.length
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Fetch new tools using Exa API and Claude
app.post('/api/fetch-tools', async (req, res) => {
  const EXA_API_KEY = process.env.EXA_API_KEY;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!EXA_API_KEY || !ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'API keys not configured. Please set EXA_API_KEY and ANTHROPIC_API_KEY environment variables.'
    });
  }

  try {
    // Search for new AI marketing tools using Exa
    const exaResponse = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EXA_API_KEY
      },
      body: JSON.stringify({
        query: 'new AI marketing tools launched 2024 2025',
        type: 'neural',
        useAutoprompt: true,
        numResults: 10,
        contents: {
          text: { maxCharacters: 1000 }
        }
      })
    });

    if (!exaResponse.ok) {
      throw new Error(`Exa API error: ${exaResponse.status}`);
    }

    const exaData = await exaResponse.json();

    // Use Claude to parse the results into structured tool data
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Extract AI marketing tools from these search results. Return a JSON array of tools with these fields: name, description (brief), category (one of: SEO, Content, Social, Analytics, Email, Ads, Video, Design), sourceUrl, usageScore (estimated 1-100), reviewSentiment (positive/neutral/negative), isNewLaunch (boolean).

Search results:
${JSON.stringify(exaData.results, null, 2)}

Return ONLY valid JSON array, no other text.`
      }]
    });

    const toolsText = message.content[0].type === 'text' ? message.content[0].text : '';
    let newTools = [];

    try {
      newTools = JSON.parse(toolsText);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Save new tools to database
    let added = 0;
    for (const tool of newTools) {
      try {
        await prisma.marketingTool.upsert({
          where: { name: tool.name },
          update: {
            description: tool.description,
            category: tool.category,
            sourceUrl: tool.sourceUrl,
            usageScore: tool.usageScore,
            reviewSentiment: tool.reviewSentiment,
            isNewLaunch: tool.isNewLaunch
          },
          create: tool
        });
        added++;
      } catch (err) {
        console.error(`Error saving tool ${tool.name}:`, err);
      }
    }

    res.json({
      success: true,
      message: `Added/updated ${added} tools`,
      tools: newTools
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch new tools' });
  }
});

// Seed database endpoint
app.post('/api/seed', async (req, res) => {
  try {
    // Run seed programmatically
    const { execSync } = require('child_process');
    execSync('npx ts-node prisma/seed.ts', { cwd: __dirname });
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve Angular app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure database tables exist
async function ensureDatabaseReady() {
  const { execSync } = require('child_process');
  try {
    console.log('Running prisma db push to ensure tables exist...');
    execSync('npx prisma db push --skip-generate', {
      cwd: __dirname,
      stdio: 'inherit',
      env: process.env
    });
    console.log('Database tables ready');
  } catch (error) {
    console.error('Error running prisma db push:', error.message);
    throw error;
  }
}

// Auto-seed database if empty
async function seedIfEmpty() {
  const count = await prisma.marketingTool.count();
  if (count > 0) {
    console.log(`Database has ${count} tools, skipping seed`);
    return;
  }

  console.log('Database empty, seeding with default tools...');

  const tools = [
    { name: "Surfer SEO", description: "AI-powered on-page SEO optimization with content editor and SERP analyzer", category: "SEO", sourceUrl: "https://surferseo.com", usageScore: 92, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Clearscope", description: "Content optimization platform using AI to improve search rankings", category: "SEO", sourceUrl: "https://clearscope.io", usageScore: 88, reviewSentiment: "positive", isNewLaunch: false },
    { name: "MarketMuse", description: "AI content planning and optimization for enterprise SEO", category: "SEO", sourceUrl: "https://marketmuse.com", usageScore: 85, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Frase", description: "AI content briefs and SEO writing assistant", category: "SEO", sourceUrl: "https://frase.io", usageScore: 82, reviewSentiment: "positive", isNewLaunch: false },
    { name: "SE Ranking", description: "All-in-one SEO platform with AI-powered insights", category: "SEO", sourceUrl: "https://seranking.com", usageScore: 79, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Jasper", description: "AI copywriting tool for marketing content, ads, and blog posts", category: "Content", sourceUrl: "https://jasper.ai", usageScore: 94, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Copy.ai", description: "AI writing assistant for marketing copy and content", category: "Content", sourceUrl: "https://copy.ai", usageScore: 89, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Writesonic", description: "AI writer for articles, ads, and product descriptions", category: "Content", sourceUrl: "https://writesonic.com", usageScore: 86, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Rytr", description: "AI writing assistant with 40+ use cases and templates", category: "Content", sourceUrl: "https://rytr.me", usageScore: 81, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Wordtune", description: "AI-powered writing companion for rewriting and editing", category: "Content", sourceUrl: "https://wordtune.com", usageScore: 78, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Hootsuite", description: "Social media management with AI-powered scheduling and analytics", category: "Social", sourceUrl: "https://hootsuite.com", usageScore: 91, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Buffer", description: "AI-assisted social media scheduling and engagement tools", category: "Social", sourceUrl: "https://buffer.com", usageScore: 87, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Sprout Social", description: "Social media management with AI listening and analytics", category: "Social", sourceUrl: "https://sproutsocial.com", usageScore: 90, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Lately", description: "AI that turns long-form content into social media posts", category: "Social", sourceUrl: "https://lately.ai", usageScore: 76, reviewSentiment: "neutral", isNewLaunch: true },
    { name: "Predis.ai", description: "AI-powered social media content generator with design", category: "Social", sourceUrl: "https://predis.ai", usageScore: 74, reviewSentiment: "neutral", isNewLaunch: true },
    { name: "Google Analytics 4", description: "AI-powered analytics with predictive insights and audiences", category: "Analytics", sourceUrl: "https://analytics.google.com", usageScore: 96, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Mixpanel", description: "Product analytics with AI-driven insights and predictions", category: "Analytics", sourceUrl: "https://mixpanel.com", usageScore: 88, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Amplitude", description: "Digital analytics platform with AI recommendations", category: "Analytics", sourceUrl: "https://amplitude.com", usageScore: 86, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Heap", description: "Auto-capture analytics with AI-powered insights", category: "Analytics", sourceUrl: "https://heap.io", usageScore: 82, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Pecan AI", description: "Predictive analytics platform for marketing teams", category: "Analytics", sourceUrl: "https://pecan.ai", usageScore: 75, reviewSentiment: "neutral", isNewLaunch: true },
    { name: "Mailchimp", description: "Email marketing with AI-powered send time optimization", category: "Email", sourceUrl: "https://mailchimp.com", usageScore: 93, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Klaviyo", description: "AI-driven email and SMS marketing for ecommerce", category: "Email", sourceUrl: "https://klaviyo.com", usageScore: 91, reviewSentiment: "positive", isNewLaunch: false },
    { name: "ActiveCampaign", description: "Marketing automation with predictive sending and content", category: "Email", sourceUrl: "https://activecampaign.com", usageScore: 89, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Seventh Sense", description: "AI email send time optimization for HubSpot and Marketo", category: "Email", sourceUrl: "https://theseventhsense.com", usageScore: 77, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Rasa.io", description: "AI-powered personalized newsletter platform", category: "Email", sourceUrl: "https://rasa.io", usageScore: 72, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Albert AI", description: "Autonomous AI for digital advertising optimization", category: "Ads", sourceUrl: "https://albert.ai", usageScore: 84, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Adzooma", description: "AI-powered PPC management for Google, Facebook, Microsoft", category: "Ads", sourceUrl: "https://adzooma.com", usageScore: 80, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Pattern89", description: "AI creative analytics for paid social advertising", category: "Ads", sourceUrl: "https://pattern89.com", usageScore: 78, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Smartly.io", description: "AI-powered social advertising automation platform", category: "Ads", sourceUrl: "https://smartly.io", usageScore: 85, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Revealbot", description: "AI rules and automation for Facebook and Google ads", category: "Ads", sourceUrl: "https://revealbot.com", usageScore: 76, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Synthesia", description: "AI video generation with virtual presenters", category: "Video", sourceUrl: "https://synthesia.io", usageScore: 90, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Pictory", description: "AI video creation from long-form content and scripts", category: "Video", sourceUrl: "https://pictory.ai", usageScore: 83, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Lumen5", description: "AI-powered video maker for content marketing", category: "Video", sourceUrl: "https://lumen5.com", usageScore: 81, reviewSentiment: "neutral", isNewLaunch: false },
    { name: "Runway", description: "AI-powered creative tools for video editing and generation", category: "Video", sourceUrl: "https://runwayml.com", usageScore: 88, reviewSentiment: "positive", isNewLaunch: true },
    { name: "HeyGen", description: "AI avatar video generation for marketing content", category: "Video", sourceUrl: "https://heygen.com", usageScore: 85, reviewSentiment: "positive", isNewLaunch: true },
    { name: "Canva", description: "AI-powered design platform with Magic Studio features", category: "Design", sourceUrl: "https://canva.com", usageScore: 95, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Midjourney", description: "AI image generation for creative marketing visuals", category: "Design", sourceUrl: "https://midjourney.com", usageScore: 92, reviewSentiment: "positive", isNewLaunch: false },
    { name: "DALL-E", description: "OpenAI's image generation for marketing graphics", category: "Design", sourceUrl: "https://openai.com/dall-e-3", usageScore: 89, reviewSentiment: "positive", isNewLaunch: false },
    { name: "Adobe Firefly", description: "AI generative tools integrated with Creative Cloud", category: "Design", sourceUrl: "https://adobe.com/products/firefly", usageScore: 87, reviewSentiment: "positive", isNewLaunch: true },
    { name: "Looka", description: "AI logo and brand identity generator", category: "Design", sourceUrl: "https://looka.com", usageScore: 79, reviewSentiment: "neutral", isNewLaunch: false },
  ];

  for (const tool of tools) {
    await prisma.marketingTool.upsert({
      where: { name: tool.name },
      update: tool,
      create: tool,
    });
  }

  console.log(`Seeded ${tools.length} marketing tools`);
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await ensureDatabaseReady();
  await seedIfEmpty();
});
