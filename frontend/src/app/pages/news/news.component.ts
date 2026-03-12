import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">News & Updates</h1>
          <p class="text-white/50">Latest AI & marketing news from around the web</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="generateSummary()"
                  [disabled]="summarizing() || news().length === 0"
                  class="btn-glass">
            @if (summarizing()) {
              <div class="loader-dots">
                <span></span><span></span><span></span>
              </div>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            AI Summary
          </button>
          <button (click)="refreshNews()"
                  [disabled]="refreshing()"
                  class="btn-neon">
            @if (refreshing()) {
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            Fetch Latest News
          </button>
        </div>
      </header>

      <!-- AI Summary -->
      @if (summary()) {
        <div class="summary-card animate-slide-up">
          <div class="summary-header">
            <div class="summary-icon">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="summary-title">AI-Generated Summary</span>
            <button (click)="summary.set('')" class="summary-close">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="summary-text">{{ summary() }}</p>
        </div>
      }

      <!-- Loading State -->
      @if (newsLoading()) {
        <div class="news-grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="news-card-skeleton">
              <div class="skeleton h-48 rounded-xl mb-4"></div>
              <div class="skeleton h-6 w-3/4 rounded-lg mb-2"></div>
              <div class="skeleton h-4 w-full rounded-lg mb-2"></div>
              <div class="skeleton h-4 w-2/3 rounded-lg"></div>
            </div>
          }
        </div>
      }

      <!-- News Grid -->
      @if (!newsLoading() && news().length > 0) {
        <div class="news-grid">
          @for (item of news(); track item.id; let i = $index) {
            <a [href]="item.sourceUrl" target="_blank" rel="noopener noreferrer"
               class="news-card animate-fade-in-up" [style.animation-delay]="(i * 0.05) + 's'">
              <div class="news-image-container">
                <div class="news-image" [style.background]="getGradientForCategory(item.category)">
                  <span class="news-emoji">{{ getCategoryEmoji(item.category) }}</span>
                </div>
                <span class="news-category" [style.background]="getCategoryColor(item.category)">
                  {{ item.category }}
                </span>
              </div>
              <div class="news-content">
                <h3 class="news-title">{{ item.title }}</h3>
                <p class="news-summary">{{ item.summary }}</p>
                <div class="news-meta">
                  <span class="news-source">{{ item.sourceName }}</span>
                  <span class="news-date">{{ formatDate(item.publishedAt) }}</span>
                </div>
              </div>
            </a>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!newsLoading() && news().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 class="empty-title">No news yet</h3>
          <p class="empty-text">Click "Fetch Latest News" to get the latest AI & marketing updates</p>
        </div>
      }

      <!-- Toast -->
      @if (message()) {
        <div class="toast" [class.success]="success()" [class.error]="!success()">
          {{ message() }}
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

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 16px;
    }

    .page-header h1 {
      font-size: 1.75rem;
    }

    .page-header > div:last-child {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .btn-glass {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-weight: 500;
      transition: all 0.3s ease;
      white-space: nowrap;
      font-size: 14px;
    }

    .btn-glass:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .btn-glass:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loader-dots {
      display: flex;
      gap: 4px;
    }

    .loader-dots span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: white;
      animation: bounce 1.4s infinite ease-in-out;
    }

    .loader-dots span:nth-child(1) { animation-delay: 0s; }
    .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loader-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .summary-card {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1));
      border: 1px solid rgba(168, 85, 247, 0.2);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .summary-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #A855F7, #3B82F6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .summary-title {
      font-weight: 600;
      color: #A855F7;
    }

    .summary-close {
      margin-left: auto;
      color: rgba(255, 255, 255, 0.4);
      transition: color 0.2s;
    }

    .summary-close:hover {
      color: white;
    }

    .summary-text {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.7;
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
    }

    .news-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .news-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
    }

    .news-card-skeleton {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 20px;
    }

    .news-image-container {
      position: relative;
    }

    .news-image {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .news-emoji {
      font-size: 48px;
      opacity: 0.5;
    }

    .news-category {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }

    .news-content {
      padding: 20px;
    }

    .news-title {
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-summary {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 16px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #A855F7;
    }

    .empty-title {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
    }

    .empty-text {
      color: rgba(255, 255, 255, 0.5);
    }

    .toast {
      position: fixed;
      bottom: 100px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 14px;
      font-weight: 500;
      color: white;
      animation: slideUp 0.3s ease;
      z-index: 100;
    }

    .toast.success {
      background: linear-gradient(135deg, #10B981, #059669);
    }

    .toast.error {
      background: linear-gradient(135deg, #EF4444, #DC2626);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Tablet */
    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
        padding-bottom: 80px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        margin-bottom: 24px;
      }

      .page-header > div:first-child {
        text-align: center;
      }

      .page-header h1 {
        font-size: 1.5rem;
        margin-bottom: 4px;
      }

      .page-header > div:last-child {
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn-glass,
      .btn-neon {
        padding: 10px 16px;
        font-size: 13px;
        gap: 6px;
      }

      .news-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .news-image {
        height: 140px;
      }

      .news-content {
        padding: 16px;
      }

      .summary-card {
        padding: 16px;
        margin-bottom: 24px;
      }

      .toast {
        left: 16px;
        right: 16px;
        bottom: 80px;
      }
    }

    /* Mobile */
    @media (max-width: 480px) {
      .page-container {
        padding: 12px;
        padding-bottom: 70px;
      }

      .page-header h1 {
        font-size: 1.25rem;
      }

      .page-header p {
        font-size: 0.75rem;
      }

      .page-header > div:last-child {
        gap: 8px;
      }

      .btn-glass,
      .btn-neon {
        padding: 10px 12px;
        font-size: 12px;
        border-radius: 10px;
      }

      .btn-glass svg,
      .btn-neon svg {
        width: 16px;
        height: 16px;
      }

      .news-card {
        border-radius: 16px;
      }

      .news-image {
        height: 120px;
      }

      .news-emoji {
        font-size: 36px;
      }

      .news-content {
        padding: 14px;
      }

      .news-title {
        font-size: 14px;
      }

      .news-summary {
        font-size: 12px;
        margin-bottom: 12px;
      }

      .news-meta {
        font-size: 11px;
      }

      .empty-state {
        padding: 40px 16px;
      }

      .empty-icon {
        width: 64px;
        height: 64px;
      }

      .empty-title {
        font-size: 18px;
      }

      .empty-text {
        font-size: 14px;
      }
    }
  `]
})
export class NewsPageComponent implements OnInit {
  private toolsService = inject(ToolsService);
  private http = inject(HttpClient);

  news = toSignal(this.toolsService.news$, { initialValue: [] });
  newsLoading = toSignal(this.toolsService.newsLoading$, { initialValue: false });

  refreshing = signal(false);
  summarizing = signal(false);
  summary = signal('');
  message = signal('');
  success = signal(false);

  ngOnInit(): void {
    this.toolsService.loadNews();
  }

  refreshNews(): void {
    this.refreshing.set(true);
    this.message.set('');

    this.toolsService.refreshNews().subscribe({
      next: (response) => {
        this.refreshing.set(false);
        this.success.set(true);
        this.message.set(response.message);
        setTimeout(() => this.message.set(''), 3000);
      },
      error: (err) => {
        this.refreshing.set(false);
        this.success.set(false);
        this.message.set(err.error?.error || 'Failed to refresh news');
        setTimeout(() => this.message.set(''), 3000);
      }
    });
  }

  generateSummary(): void {
    this.summarizing.set(true);
    const newsItems = this.news();

    this.http.post<{ summary: string }>(`${environment.apiUrl}/api/news/summary`, { news: newsItems }).subscribe({
      next: (response) => {
        this.summarizing.set(false);
        this.summary.set(response.summary);
      },
      error: () => {
        this.summarizing.set(false);
        this.message.set('Failed to generate summary');
        this.success.set(false);
        setTimeout(() => this.message.set(''), 3000);
      }
    });
  }

  getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'AI': '🤖',
      'Marketing': '📈',
      'Tech': '💻',
      'Business': '💼'
    };
    return emojis[category] || '📰';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'AI': 'linear-gradient(135deg, #A855F7, #6366F1)',
      'Marketing': 'linear-gradient(135deg, #F59E0B, #EF4444)',
      'Tech': 'linear-gradient(135deg, #3B82F6, #06B6D4)',
      'Business': 'linear-gradient(135deg, #10B981, #059669)'
    };
    return colors[category] || 'linear-gradient(135deg, #6B7280, #4B5563)';
  }

  getGradientForCategory(category: string): string {
    const gradients: Record<string, string> = {
      'AI': 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))',
      'Marketing': 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.3))',
      'Tech': 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3))',
      'Business': 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))'
    };
    return gradients[category] || 'linear-gradient(135deg, rgba(107, 114, 128, 0.3), rgba(75, 85, 99, 0.3))';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
