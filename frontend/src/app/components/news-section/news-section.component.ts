import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">AI & Marketing News</h2>
            <p class="text-xs text-white/50">Top stories this week</p>
          </div>
        </div>

        @if (!isSharedView) {
          <button (click)="refreshNews()"
                  [disabled]="refreshing()"
                  class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50">
            <svg class="w-5 h-5" [class.animate-spin]="refreshing()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        }
      </div>

      <!-- AI Summary Button -->
      @if (news().length > 0 && !isSharedView) {
        <button (click)="generateSummary()"
                [disabled]="summarizing()"
                class="btn-summary w-full mb-6">
          @if (summarizing()) {
            <div class="loader-container">
              <div class="loader-dot"></div>
              <div class="loader-dot"></div>
              <div class="loader-dot"></div>
            </div>
            <span>Generating AI Summary...</span>
          } @else {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Get AI Summary</span>
          }
        </button>
      }

      <!-- AI Summary Display -->
      @if (summary()) {
        <div class="mb-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-indigo-300">AI Summary</span>
            <button (click)="summary.set('')" class="ml-auto text-white/40 hover:text-white/60">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-sm text-white/80 leading-relaxed">{{ summary() }}</p>
        </div>
      }

      <!-- Loading State -->
      @if (newsLoading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="animate-slide-up opacity-0" [style.animation-delay]="(i * 0.1) + 's'">
              <div class="skeleton h-40 mb-3"></div>
              <div class="skeleton h-5 w-3/4 mb-2"></div>
              <div class="skeleton h-4 w-full mb-2"></div>
              <div class="skeleton h-3 w-1/3"></div>
            </div>
          }
        </div>
      }

      <!-- News List -->
      @if (!newsLoading() && news().length > 0) {
        <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          @for (item of news(); track item.id; let i = $index) {
            <a [href]="item.sourceUrl" target="_blank" rel="noopener noreferrer"
               class="block group animate-slide-up opacity-0" [style.animation-delay]="(i * 0.1) + 's'">
              <div class="tool-card">
                <!-- Image -->
                <div class="relative mb-4 overflow-hidden rounded-xl">
                  <div class="news-image flex items-center justify-center"
                       [style.background]="getGradientForCategory(item.category)">
                    <span class="text-4xl opacity-50">{{ getCategoryEmoji(item.category) }}</span>
                  </div>
                  <div class="absolute top-3 left-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                          [style.background]="getCategoryColor(item.category)"
                          style="color: white;">
                      {{ item.category }}
                    </span>
                  </div>
                  <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Content -->
                <h3 class="font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                  {{ item.title }}
                </h3>
                <p class="text-sm text-white/60 mb-3 line-clamp-2">{{ item.summary }}</p>

                <!-- Meta -->
                <div class="flex items-center justify-between text-xs text-white/40">
                  <span>{{ item.sourceName }}</span>
                  <span>{{ formatDate(item.publishedAt) }}</span>
                </div>
              </div>
            </a>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!newsLoading() && news().length === 0) {
        <div class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p class="text-white/60 text-sm">No news yet</p>
          @if (!isSharedView) {
            <p class="text-white/40 text-xs mt-1">Click refresh to fetch latest news</p>
          }
        </div>
      }

      <!-- Toast -->
      @if (message()) {
        <div class="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl"
               [class]="success() ? 'bg-emerald-500/90' : 'bg-red-500/90'">
            <span class="text-sm font-medium text-white">{{ message() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NewsSectionComponent {
  @Input() isSharedView = false;

  private toolsService = inject(ToolsService);
  private http = inject(HttpClient);

  news = toSignal(this.toolsService.news$, { initialValue: [] });
  newsLoading = toSignal(this.toolsService.newsLoading$, { initialValue: false });

  refreshing = signal(false);
  summarizing = signal(false);
  summary = signal('');
  message = signal('');
  success = signal(false);

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
      error: (err) => {
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
      'AI': 'linear-gradient(135deg, #8b5cf6, #6366f1)',
      'Marketing': 'linear-gradient(135deg, #f59e0b, #ef4444)',
      'Tech': 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'Business': 'linear-gradient(135deg, #10b981, #059669)'
    };
    return colors[category] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  getGradientForCategory(category: string): string {
    const gradients: Record<string, string> = {
      'AI': 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3))',
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
