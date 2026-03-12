import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToolsService } from '../../services/tools.service';
import { MarketingTool } from '../../models/marketing-tool.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Saved Tools</h1>
        <p class="text-white/50">Your favorite marketing AI tools</p>
      </header>

      @if (favoriteTools().length > 0) {
        <div class="tools-grid">
          @for (tool of favoriteTools(); track tool.id) {
            <div class="glass-card-static tool-card group">
              <div class="tool-header">
                <div class="tool-icon" [style.background]="getGradient(tool.category)">
                  <span class="text-2xl">{{ getCategoryIcon(tool.category) }}</span>
                </div>
                <div class="tool-info">
                  <h3 class="tool-name">{{ tool.name }}</h3>
                  <span class="tool-category">{{ tool.category }}</span>
                </div>
                <button (click)="removeFavorite(tool.id)" class="remove-btn" title="Remove from favorites">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
              <p class="tool-description">{{ tool.description }}</p>
              <div class="tool-stats">
                <div class="stat">
                  <span class="stat-value">{{ tool.usageScore }}</span>
                  <span class="stat-label">Score</span>
                </div>
                <div class="stat">
                  <span class="stat-value sentiment" [class]="tool.reviewSentiment">{{ tool.reviewSentiment }}</span>
                  <span class="stat-label">Sentiment</span>
                </div>
              </div>
              <div class="tool-actions">
                <a [routerLink]="['/tools', tool.id]" class="view-btn">View Details</a>
                <a [href]="tool.sourceUrl" target="_blank" class="visit-btn">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit
                </a>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="glass-card-static p-12 text-center">
          <div class="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <svg class="w-12 h-12 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-3">No Saved Tools Yet</h2>
          <p class="text-white/50 mb-6 max-w-md mx-auto">
            Start exploring AI marketing tools and save your favorites by clicking the star icon on any tool.
          </p>
          <a routerLink="/" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Tools
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
      padding-bottom: 100px;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .tool-card {
      padding: 20px;
      transition: all 0.3s ease;
    }

    .tool-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(168, 85, 247, 0.15);
    }

    .tool-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }

    .tool-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tool-info {
      flex: 1;
      min-width: 0;
    }

    .tool-name {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tool-category {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .remove-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      transform: scale(1.05);
    }

    .remove-btn svg {
      width: 18px;
      height: 18px;
    }

    .tool-description {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
      margin-bottom: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tool-stats {
      display: flex;
      gap: 20px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      margin-bottom: 14px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: white;
    }

    .stat-value.sentiment {
      font-size: 13px;
      text-transform: capitalize;
    }

    .stat-value.sentiment.positive {
      color: #4ade80;
    }

    .stat-value.sentiment.neutral {
      color: #fbbf24;
    }

    .stat-value.sentiment.negative {
      color: #f87171;
    }

    .stat-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tool-actions {
      display: flex;
      gap: 10px;
    }

    .view-btn {
      flex: 1;
      padding: 12px 16px;
      background: linear-gradient(135deg, #A855F7, #3B82F6);
      color: white;
      font-weight: 600;
      font-size: 13px;
      border-radius: 10px;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s;
    }

    .view-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
    }

    .visit-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
      font-size: 13px;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .visit-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    /* Tablet */
    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
        padding-bottom: 80px;
      }

      .page-container header h1 {
        font-size: 1.5rem;
      }

      .tools-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .tool-card {
        padding: 16px;
      }
    }

    /* Mobile */
    @media (max-width: 480px) {
      .page-container {
        padding: 12px;
        padding-bottom: 70px;
      }

      .page-container header {
        margin-bottom: 20px;
      }

      .page-container header h1 {
        font-size: 1.25rem;
        margin-bottom: 4px;
      }

      .page-container header p {
        font-size: 0.75rem;
      }

      .tool-card {
        padding: 14px;
      }

      .tool-header {
        gap: 12px;
        margin-bottom: 12px;
      }

      .tool-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
      }

      .tool-icon span {
        font-size: 1.25rem;
      }

      .tool-name {
        font-size: 14px;
      }

      .tool-category {
        font-size: 11px;
      }

      .remove-btn {
        width: 32px;
        height: 32px;
      }

      .remove-btn svg {
        width: 16px;
        height: 16px;
      }

      .tool-description {
        font-size: 12px;
        margin-bottom: 12px;
      }

      .tool-stats {
        gap: 16px;
        padding: 12px;
        margin-bottom: 12px;
      }

      .stat-value {
        font-size: 14px;
      }

      .stat-label {
        font-size: 10px;
      }

      .tool-actions {
        gap: 8px;
      }

      .view-btn,
      .visit-btn {
        padding: 10px 12px;
        font-size: 12px;
        border-radius: 8px;
      }

      .visit-btn svg {
        width: 14px;
        height: 14px;
      }

      /* Empty state mobile */
      .glass-card-static.p-12 {
        padding: 32px 16px;
      }

      .glass-card-static .w-24 {
        width: 64px;
        height: 64px;
      }

      .glass-card-static .w-12 {
        width: 32px;
        height: 32px;
      }

      .glass-card-static h2 {
        font-size: 1.25rem;
      }

      .glass-card-static p {
        font-size: 0.875rem;
      }

      .glass-card-static a {
        padding: 12px 20px;
        font-size: 14px;
      }
    }
  `]
})
export class FavoritesComponent implements OnInit {
  private toolsService = inject(ToolsService);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] });
  favoriteIds = signal<number[]>([]);

  favoriteTools = computed(() => {
    const ids = this.favoriteIds();
    const allTools = this.tools();
    return allTools.filter(tool => ids.includes(tool.id));
  });

  ngOnInit(): void {
    this.toolsService.loadTools();
    this.loadFavorites();
  }

  loadFavorites(): void {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      this.favoriteIds.set(JSON.parse(stored));
    }
  }

  removeFavorite(toolId: number): void {
    const favorites = this.favoriteIds().filter(id => id !== toolId);
    this.favoriteIds.set(favorites);
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
}
