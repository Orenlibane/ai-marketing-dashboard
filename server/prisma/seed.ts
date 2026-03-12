import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tools = [
  // SEO Tools
  { name: "Surfer SEO", description: "AI-powered on-page SEO optimization with content editor and SERP analyzer", category: "SEO", sourceUrl: "https://surferseo.com", usageScore: 92, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Clearscope", description: "Content optimization platform using AI to improve search rankings", category: "SEO", sourceUrl: "https://clearscope.io", usageScore: 88, reviewSentiment: "positive", isNewLaunch: false },
  { name: "MarketMuse", description: "AI content planning and optimization for enterprise SEO", category: "SEO", sourceUrl: "https://marketmuse.com", usageScore: 85, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Frase", description: "AI content briefs and SEO writing assistant", category: "SEO", sourceUrl: "https://frase.io", usageScore: 82, reviewSentiment: "positive", isNewLaunch: false },
  { name: "SE Ranking", description: "All-in-one SEO platform with AI-powered insights", category: "SEO", sourceUrl: "https://seranking.com", usageScore: 79, reviewSentiment: "neutral", isNewLaunch: false },

  // Content Creation
  { name: "Jasper", description: "AI copywriting tool for marketing content, ads, and blog posts", category: "Content", sourceUrl: "https://jasper.ai", usageScore: 94, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Copy.ai", description: "AI writing assistant for marketing copy and content", category: "Content", sourceUrl: "https://copy.ai", usageScore: 89, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Writesonic", description: "AI writer for articles, ads, and product descriptions", category: "Content", sourceUrl: "https://writesonic.com", usageScore: 86, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Rytr", description: "AI writing assistant with 40+ use cases and templates", category: "Content", sourceUrl: "https://rytr.me", usageScore: 81, reviewSentiment: "neutral", isNewLaunch: false },
  { name: "Wordtune", description: "AI-powered writing companion for rewriting and editing", category: "Content", sourceUrl: "https://wordtune.com", usageScore: 78, reviewSentiment: "neutral", isNewLaunch: false },

  // Social Media
  { name: "Hootsuite", description: "Social media management with AI-powered scheduling and analytics", category: "Social", sourceUrl: "https://hootsuite.com", usageScore: 91, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Buffer", description: "AI-assisted social media scheduling and engagement tools", category: "Social", sourceUrl: "https://buffer.com", usageScore: 87, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Sprout Social", description: "Social media management with AI listening and analytics", category: "Social", sourceUrl: "https://sproutsocial.com", usageScore: 90, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Lately", description: "AI that turns long-form content into social media posts", category: "Social", sourceUrl: "https://lately.ai", usageScore: 76, reviewSentiment: "neutral", isNewLaunch: true },
  { name: "Predis.ai", description: "AI-powered social media content generator with design", category: "Social", sourceUrl: "https://predis.ai", usageScore: 74, reviewSentiment: "neutral", isNewLaunch: true },

  // Analytics
  { name: "Google Analytics 4", description: "AI-powered analytics with predictive insights and audiences", category: "Analytics", sourceUrl: "https://analytics.google.com", usageScore: 96, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Mixpanel", description: "Product analytics with AI-driven insights and predictions", category: "Analytics", sourceUrl: "https://mixpanel.com", usageScore: 88, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Amplitude", description: "Digital analytics platform with AI recommendations", category: "Analytics", sourceUrl: "https://amplitude.com", usageScore: 86, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Heap", description: "Auto-capture analytics with AI-powered insights", category: "Analytics", sourceUrl: "https://heap.io", usageScore: 82, reviewSentiment: "neutral", isNewLaunch: false },
  { name: "Pecan AI", description: "Predictive analytics platform for marketing teams", category: "Analytics", sourceUrl: "https://pecan.ai", usageScore: 75, reviewSentiment: "neutral", isNewLaunch: true },

  // Email Marketing
  { name: "Mailchimp", description: "Email marketing with AI-powered send time optimization", category: "Email", sourceUrl: "https://mailchimp.com", usageScore: 93, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Klaviyo", description: "AI-driven email and SMS marketing for ecommerce", category: "Email", sourceUrl: "https://klaviyo.com", usageScore: 91, reviewSentiment: "positive", isNewLaunch: false },
  { name: "ActiveCampaign", description: "Marketing automation with predictive sending and content", category: "Email", sourceUrl: "https://activecampaign.com", usageScore: 89, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Seventh Sense", description: "AI email send time optimization for HubSpot and Marketo", category: "Email", sourceUrl: "https://theseventhsense.com", usageScore: 77, reviewSentiment: "neutral", isNewLaunch: false },
  { name: "Rasa.io", description: "AI-powered personalized newsletter platform", category: "Email", sourceUrl: "https://rasa.io", usageScore: 72, reviewSentiment: "neutral", isNewLaunch: false },

  // Advertising
  { name: "Albert AI", description: "Autonomous AI for digital advertising optimization", category: "Ads", sourceUrl: "https://albert.ai", usageScore: 84, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Adzooma", description: "AI-powered PPC management for Google, Facebook, Microsoft", category: "Ads", sourceUrl: "https://adzooma.com", usageScore: 80, reviewSentiment: "neutral", isNewLaunch: false },
  { name: "Pattern89", description: "AI creative analytics for paid social advertising", category: "Ads", sourceUrl: "https://pattern89.com", usageScore: 78, reviewSentiment: "neutral", isNewLaunch: false },
  { name: "Smartly.io", description: "AI-powered social advertising automation platform", category: "Ads", sourceUrl: "https://smartly.io", usageScore: 85, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Revealbot", description: "AI rules and automation for Facebook and Google ads", category: "Ads", sourceUrl: "https://revealbot.com", usageScore: 76, reviewSentiment: "neutral", isNewLaunch: false },

  // Video
  { name: "Synthesia", description: "AI video generation with virtual presenters", category: "Video", sourceUrl: "https://synthesia.io", usageScore: 90, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Pictory", description: "AI video creation from long-form content and scripts", category: "Video", sourceUrl: "https://pictory.ai", usageScore: 83, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Lumen5", description: "AI-powered video maker for content marketing", category: "Video", sourceUrl: "https://lumen5.com", usageScore: 81, reviewSentiment: "neutral", isNewLaunch: false },
  { name: "Runway", description: "AI-powered creative tools for video editing and generation", category: "Video", sourceUrl: "https://runwayml.com", usageScore: 88, reviewSentiment: "positive", isNewLaunch: true },
  { name: "HeyGen", description: "AI avatar video generation for marketing content", category: "Video", sourceUrl: "https://heygen.com", usageScore: 85, reviewSentiment: "positive", isNewLaunch: true },

  // Design
  { name: "Canva", description: "AI-powered design platform with Magic Studio features", category: "Design", sourceUrl: "https://canva.com", usageScore: 95, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Midjourney", description: "AI image generation for creative marketing visuals", category: "Design", sourceUrl: "https://midjourney.com", usageScore: 92, reviewSentiment: "positive", isNewLaunch: false },
  { name: "DALL-E", description: "OpenAI's image generation for marketing graphics", category: "Design", sourceUrl: "https://openai.com/dall-e-3", usageScore: 89, reviewSentiment: "positive", isNewLaunch: false },
  { name: "Adobe Firefly", description: "AI generative tools integrated with Creative Cloud", category: "Design", sourceUrl: "https://adobe.com/products/firefly", usageScore: 87, reviewSentiment: "positive", isNewLaunch: true },
  { name: "Looka", description: "AI logo and brand identity generator", category: "Design", sourceUrl: "https://looka.com", usageScore: 79, reviewSentiment: "neutral", isNewLaunch: false },
];

async function main() {
  console.log('Seeding database...');

  for (const tool of tools) {
    await prisma.marketingTool.upsert({
      where: { name: tool.name },
      update: tool,
      create: tool,
    });
  }

  console.log(`Seeded ${tools.length} marketing tools`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
