import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToolsService } from '../../services/tools.service';
import { MarketingTool } from '../../models/marketing-tool.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tool-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tool-detail-page">
      <!-- Back Button -->
      <a routerLink="/" class="back-btn">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </a>

      @if (tool(); as t) {
        <!-- Hero Section -->
        <div class="tool-hero">
          <div class="hero-content">
            <div class="tool-icon" [style.background]="getGradient(t.category)">
              <span class="text-4xl">{{ getCategoryIcon(t.category) }}</span>
            </div>
            <div class="hero-info">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="tool-name">{{ t.name }}</h1>
                @if (t.isNewLaunch) {
                  <span class="badge-new">NEW</span>
                }
              </div>
              <p class="tool-category">{{ t.category }} Tool</p>
              <p class="tool-description">{{ t.description }}</p>
            </div>
          </div>
          <div class="hero-actions">
            <button (click)="toggleFavorite()" class="btn-favorite" [class.active]="isFavorite()">
              <svg class="w-5 h-5" [attr.fill]="isFavorite() ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {{ isFavorite() ? 'Saved' : 'Save' }}
            </button>
            <a [href]="t.sourceUrl" target="_blank" class="btn-primary">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Website
            </a>
            <button (click)="shareToTwitter()" class="btn-share twitter">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button (click)="shareToLinkedIn()" class="btn-share linkedin">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ t.usageScore }}</span>
              <span class="stat-label">Usage Score</span>
            </div>
            <div class="stat-bar">
              <div class="stat-bar-fill" [style.width.%]="t.usageScore"></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" [class]="getSentimentClass(t.reviewSentiment)">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value capitalize">{{ t.reviewSentiment }}</span>
              <span class="stat-label">Sentiment</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon purple">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ formatDate(t.dateAdded) }}</span>
              <span class="stat-label">Date Added</span>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Features Section -->
          <div class="content-card">
            <h3 class="card-title">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Key Features
            </h3>
            <ul class="feature-list">
              @for (feature of getFeatures(t); track feature) {
                <li class="feature-item">
                  <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ feature }}
                </li>
              }
            </ul>
          </div>

          <!-- Pricing Section -->
          <div class="content-card">
            <h3 class="card-title">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pricing
            </h3>
            <div class="pricing-tiers">
              @for (tier of getPricingTiers(t); track tier.name) {
                <div class="pricing-tier" [class.featured]="tier.featured">
                  @if (tier.featured) {
                    <span class="tier-badge">Popular</span>
                  }
                  <h4 class="tier-name">{{ tier.name }}</h4>
                  <div class="tier-price">
                    <span class="price">{{ tier.price }}</span>
                    @if (tier.period) {
                      <span class="period">/{{ tier.period }}</span>
                    }
                  </div>
                  <p class="tier-desc">{{ tier.description }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Integrations Section -->
          <div class="content-card full-width">
            <h3 class="card-title">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Integrations
            </h3>
            <div class="integrations-grid">
              @for (integration of getIntegrations(t); track integration.name) {
                <div class="integration-card">
                  <span class="integration-icon">{{ integration.icon }}</span>
                  <span class="integration-name">{{ integration.name }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Similar Tools -->
        <div class="similar-section">
          <h3 class="section-title">Similar Tools</h3>
          <div class="similar-grid">
            @for (similar of similarTools(); track similar.id) {
              <a [routerLink]="['/tools', similar.id]" class="similar-card">
                <div class="similar-icon" [style.background]="getGradient(similar.category)">
                  <span>{{ getCategoryIcon(similar.category) }}</span>
                </div>
                <div class="similar-info">
                  <h4 class="similar-name">{{ similar.name }}</h4>
                  <p class="similar-category">{{ similar.category }}</p>
                </div>
                <div class="similar-score">{{ similar.usageScore }}</div>
              </a>
            }
          </div>
        </div>
      } @else {
        <div class="loading-state">
          <div class="loader-container">
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
          </div>
          <p class="mt-4 text-gray-500">Loading tool details...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .tool-detail-page {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6B7280;
      font-weight: 500;
      margin-bottom: 24px;
      transition: color 0.2s;
    }

    .back-btn:hover {
      color: #FF5722;
    }

    .tool-hero {
      background: white;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 24px;
    }

    .hero-content {
      display: flex;
      gap: 24px;
    }

    .tool-icon {
      width: 100px;
      height: 100px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tool-name {
      font-size: 32px;
      font-weight: 700;
      color: #1A253D;
    }

    .badge-new {
      background: linear-gradient(135deg, #4CAF50, #66BB6A);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .tool-category {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 8px;
    }

    .tool-description {
      font-size: 16px;
      color: #374151;
      max-width: 500px;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn-favorite {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      background: #F3F4F6;
      color: #374151;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-favorite.active {
      background: #FFF3E0;
      color: #FF5722;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FF5722, #FF7043);
      color: white;
      font-weight: 600;
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 87, 34, 0.3);
    }

    .btn-share {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s;
    }

    .btn-share.twitter {
      background: #1DA1F2;
    }

    .btn-share.linkedin {
      background: #0A66C2;
    }

    .btn-share:hover {
      transform: translateY(-2px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 12px;
    }

    .stat-icon.blue {
      background: linear-gradient(135deg, #3B82F6, #60A5FA);
    }

    .stat-icon.green {
      background: linear-gradient(135deg, #10B981, #34D399);
    }

    .stat-icon.yellow {
      background: linear-gradient(135deg, #F59E0B, #FBBF24);
    }

    .stat-icon.red {
      background: linear-gradient(135deg, #EF4444, #F87171);
    }

    .stat-icon.purple {
      background: linear-gradient(135deg, #8B5CF6, #A78BFA);
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #1A253D;
    }

    .stat-label {
      font-size: 13px;
      color: #6B7280;
    }

    .stat-bar {
      height: 6px;
      background: #E5E7EB;
      border-radius: 3px;
      margin-top: 12px;
      overflow: hidden;
    }

    .stat-bar-fill {
      height: 100%;
      background: linear-gradient(135deg, #FF5722, #FF7043);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .content-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    }

    .content-card.full-width {
      grid-column: span 2;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 600;
      color: #1A253D;
      margin-bottom: 20px;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #374151;
      font-size: 14px;
    }

    .pricing-tiers {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .pricing-tier {
      background: #F9FAFB;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      position: relative;
      border: 2px solid transparent;
      transition: all 0.2s;
    }

    .pricing-tier.featured {
      background: linear-gradient(135deg, #FFF7ED, #FFEDD5);
      border-color: #FF5722;
    }

    .tier-badge {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #FF5722;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    .tier-name {
      font-size: 16px;
      font-weight: 600;
      color: #1A253D;
      margin-bottom: 8px;
    }

    .tier-price {
      margin-bottom: 8px;
    }

    .price {
      font-size: 28px;
      font-weight: 700;
      color: #1A253D;
    }

    .period {
      font-size: 14px;
      color: #6B7280;
    }

    .tier-desc {
      font-size: 13px;
      color: #6B7280;
    }

    .integrations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .integration-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #F9FAFB;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .integration-card:hover {
      background: #F3F4F6;
    }

    .integration-icon {
      font-size: 20px;
    }

    .integration-name {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .similar-section {
      margin-top: 32px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1A253D;
      margin-bottom: 16px;
    }

    .similar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .similar-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      text-decoration: none;
      transition: all 0.2s;
    }

    .similar-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .similar-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .similar-name {
      font-size: 15px;
      font-weight: 600;
      color: #1A253D;
    }

    .similar-category {
      font-size: 13px;
      color: #6B7280;
    }

    .similar-score {
      margin-left: auto;
      font-size: 18px;
      font-weight: 700;
      color: #10B981;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .tool-hero {
        flex-direction: column;
      }

      .hero-content {
        flex-direction: column;
        text-align: center;
      }

      .tool-icon {
        margin: 0 auto;
      }

      .hero-actions {
        width: 100%;
        flex-wrap: wrap;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .content-card.full-width {
        grid-column: span 1;
      }

      .pricing-tiers {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ToolDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toolsService = inject(ToolsService);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] });
  tool = signal<MarketingTool | null>(null);
  isFavorite = signal(false);

  similarTools = computed(() => {
    const currentTool = this.tool();
    if (!currentTool) return [];

    return this.tools()
      .filter(t => t.category === currentTool.category && t.id !== currentTool.id)
      .slice(0, 4);
  });

  ngOnInit(): void {
    this.toolsService.loadTools();

    this.route.params.subscribe(params => {
      const toolId = parseInt(params['id'], 10);

      // Watch for tools to load
      const checkTools = () => {
        const allTools = this.tools();
        if (allTools.length > 0) {
          const found = allTools.find(t => t.id === toolId);
          if (found) {
            this.tool.set(found);
            this.checkFavorite(toolId);
          }
        } else {
          setTimeout(checkTools, 100);
        }
      };
      checkTools();
    });
  }

  checkFavorite(toolId: number): void {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    this.isFavorite.set(favorites.includes(toolId));
  }

  toggleFavorite(): void {
    const tool = this.tool();
    if (!tool) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(tool.id);

    if (index > -1) {
      favorites.splice(index, 1);
      this.isFavorite.set(false);
    } else {
      favorites.push(tool.id);
      this.isFavorite.set(true);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'SEO': '🔍',
      'Content': '✍️',
      'Social': '📱',
      'Analytics': '📊',
      'Email': '📧',
      'Ads': '📢',
      'Video': '🎬',
      'Design': '🎨'
    };
    return icons[category] || '🔧';
  }

  getGradient(category: string): string {
    const gradients: Record<string, string> = {
      'SEO': 'linear-gradient(135deg, #3B82F6, #60A5FA)',
      'Content': 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
      'Social': 'linear-gradient(135deg, #EC4899, #F472B6)',
      'Analytics': 'linear-gradient(135deg, #06B6D4, #22D3EE)',
      'Email': 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      'Ads': 'linear-gradient(135deg, #FF5722, #FF7043)',
      'Video': 'linear-gradient(135deg, #EF4444, #F87171)',
      'Design': 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
    };
    return gradients[category] || 'linear-gradient(135deg, #6B7280, #9CA3AF)';
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return 'green';
      case 'neutral': return 'yellow';
      case 'negative': return 'red';
      default: return 'blue';
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getFeatures(tool: MarketingTool): string[] {
    const featureMap: Record<string, string[]> = {
      'SEO': ['Keyword Research', 'On-page Optimization', 'Competitor Analysis', 'Rank Tracking', 'Backlink Analysis'],
      'Content': ['AI Writing Assistant', 'Content Templates', 'Plagiarism Checker', 'SEO Suggestions', 'Multi-language Support'],
      'Social': ['Post Scheduling', 'Analytics Dashboard', 'Team Collaboration', 'Content Calendar', 'Auto-posting'],
      'Analytics': ['Real-time Data', 'Custom Reports', 'User Behavior', 'Conversion Tracking', 'A/B Testing'],
      'Email': ['Campaign Builder', 'Automation Workflows', 'A/B Testing', 'Segmentation', 'Analytics'],
      'Ads': ['Campaign Management', 'Budget Optimization', 'Audience Targeting', 'Performance Reports', 'Multi-platform'],
      'Video': ['AI Video Generation', 'Templates Library', 'Auto-captions', 'Brand Kit', 'Collaboration'],
      'Design': ['AI Image Generation', 'Templates', 'Brand Kit', 'Collaboration', 'Export Options']
    };
    return featureMap[tool.category] || ['Feature 1', 'Feature 2', 'Feature 3'];
  }

  getPricingTiers(tool: MarketingTool): any[] {
    return [
      { name: 'Free', price: '$0', description: 'Basic features for individuals', featured: false },
      { name: 'Pro', price: '$29', period: 'mo', description: 'Advanced features for teams', featured: true },
      { name: 'Enterprise', price: 'Custom', description: 'Full suite for large orgs', featured: false }
    ];
  }

  getIntegrations(tool: MarketingTool): any[] {
    const integrationsMap: Record<string, any[]> = {
      'SEO': [
        { name: 'Google Search Console', icon: '🔍' },
        { name: 'Google Analytics', icon: '📊' },
        { name: 'WordPress', icon: '📝' },
        { name: 'Shopify', icon: '🛒' },
        { name: 'HubSpot', icon: '🎯' },
        { name: 'Slack', icon: '💬' }
      ],
      'Content': [
        { name: 'WordPress', icon: '📝' },
        { name: 'Medium', icon: '📖' },
        { name: 'Google Docs', icon: '📄' },
        { name: 'Notion', icon: '📓' },
        { name: 'Grammarly', icon: '✏️' }
      ],
      'Social': [
        { name: 'Instagram', icon: '📷' },
        { name: 'Twitter/X', icon: '🐦' },
        { name: 'LinkedIn', icon: '💼' },
        { name: 'Facebook', icon: '👥' },
        { name: 'TikTok', icon: '🎵' },
        { name: 'Pinterest', icon: '📌' }
      ],
      'Analytics': [
        { name: 'Google Analytics', icon: '📊' },
        { name: 'Segment', icon: '📈' },
        { name: 'Mixpanel', icon: '🔬' },
        { name: 'Amplitude', icon: '📉' }
      ],
      'Email': [
        { name: 'Zapier', icon: '⚡' },
        { name: 'Shopify', icon: '🛒' },
        { name: 'Salesforce', icon: '☁️' },
        { name: 'HubSpot', icon: '🎯' }
      ],
      'Ads': [
        { name: 'Google Ads', icon: '📢' },
        { name: 'Facebook Ads', icon: '👥' },
        { name: 'LinkedIn Ads', icon: '💼' },
        { name: 'Analytics', icon: '📊' }
      ],
      'Video': [
        { name: 'YouTube', icon: '▶️' },
        { name: 'Vimeo', icon: '🎬' },
        { name: 'TikTok', icon: '🎵' },
        { name: 'Canva', icon: '🎨' }
      ],
      'Design': [
        { name: 'Figma', icon: '🎨' },
        { name: 'Adobe CC', icon: '🖼️' },
        { name: 'Canva', icon: '✨' },
        { name: 'Dropbox', icon: '📦' }
      ]
    };
    return integrationsMap[tool.category] || [];
  }

  shareToTwitter(): void {
    const tool = this.tool();
    if (!tool) return;

    const text = `Check out ${tool.name} - ${tool.description}`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  shareToLinkedIn(): void {
    const tool = this.tool();
    if (!tool) return;

    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  }
}
