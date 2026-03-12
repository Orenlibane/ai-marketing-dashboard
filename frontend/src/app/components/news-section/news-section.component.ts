import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 sm:p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="icon-circle orange">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-[#1A253D]">AI & Marketing News</h2>
            <p class="text-sm text-gray-500">Top 10 stories this week</p>
          </div>
        </div>

        <!-- Refresh Button (only if not shared view) -->
        @if (!isSharedView) {
          <button (click)="refreshNews()"
                  [disabled]="refreshing()"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#FF5722] hover:text-white transition-all disabled:opacity-50">
            @if (refreshing()) {
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            <span>Refresh</span>
          </button>
        }
      </div>

      <!-- Loading State -->
      @if (newsLoading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50 animate-pulse">
              <div class="w-16 h-16 rounded-xl bg-gray-200"></div>
              <div class="flex-1">
                <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div class="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- News List -->
      @if (!newsLoading() && news().length > 0) {
        <div class="space-y-3">
          @for (item of news(); track item.id; let i = $index) {
            <a [href]="item.sourceUrl" target="_blank" rel="noopener noreferrer"
               class="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
              <!-- Number Badge -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                   [class]="getNumberBgClass(i)">
                {{ i + 1 }}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-semibold text-[#1A253D] group-hover:text-[#FF5722] transition-colors line-clamp-2">
                    {{ item.title }}
                  </h3>
                  <span class="badge text-xs flex-shrink-0" [ngClass]="getCategoryBadgeClass(item.category)">
                    {{ item.category }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1 line-clamp-1">{{ item.summary }}</p>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{{ item.sourceName }}</span>
                  <span>•</span>
                  <span>{{ formatDate(item.publishedAt) }}</span>
                </div>
              </div>

              <!-- Arrow -->
              <svg class="w-5 h-5 text-gray-300 group-hover:text-[#FF5722] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!newsLoading() && news().length === 0) {
        <div class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-700 mb-1">No news available</h3>
          <p class="text-sm text-gray-500">Click refresh to fetch the latest news</p>
        </div>
      }

      <!-- Toast -->
      @if (message()) {
        <div class="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
               [class]="success() ? 'bg-[#4CAF50]' : 'bg-[#F44336]'">
            <span class="text-sm font-medium text-white">{{ message() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
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

  news = toSignal(this.toolsService.news$, { initialValue: [] });
  newsLoading = toSignal(this.toolsService.newsLoading$, { initialValue: false });

  refreshing = signal(false);
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

  getNumberBgClass(index: number): string {
    const colors = [
      'bg-gradient-to-br from-[#FF5722] to-[#FF7043]',
      'bg-gradient-to-br from-[#4CAF50] to-[#66BB6A]',
      'bg-gradient-to-br from-[#448AFF] to-[#82B1FF]',
      'bg-gradient-to-br from-[#7C4DFF] to-[#B388FF]',
      'bg-gradient-to-br from-[#E91E63] to-[#F06292]'
    ];
    return colors[index % colors.length];
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'AI': return 'bg-purple-100 text-purple-700';
      case 'Marketing': return 'bg-orange-100 text-orange-700';
      case 'Tech': return 'bg-blue-100 text-blue-700';
      case 'Business': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
