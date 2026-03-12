const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
      model: 'claude-haiku-4-5-20250514',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
