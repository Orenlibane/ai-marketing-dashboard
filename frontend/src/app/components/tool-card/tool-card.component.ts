import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketingTool } from '../../models/marketing-tool.model';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a [href]="tool.sourceUrl" target="_blank" rel="noopener noreferrer"
       class="group block glass-card rounded-2xl p-5 cursor-pointer relative overflow-hidden">

      <!-- Gradient overlay on hover -->
      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>

      <!-- Content -->
      <div class="relative z-10">
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Tool Icon -->
            <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                 [class]="getCategoryColorClass(tool.category)">
              {{ getCategoryIcon(tool.category) }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                {{ tool.name }}
              </h3>
              <span class="text-xs text-gray-500">{{ tool.category }}</span>
            </div>
          </div>

          <!-- Badges -->
          <div class="flex items-center gap-2 flex-shrink-0">
            @if (tool.isNewLaunch) {
              <span class="badge badge-new text-[10px] px-2 py-0.5">NEW</span>
            }
          </div>
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {{ tool.description }}
        </p>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-3 border-t border-white/5">
          <!-- Score -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              @for (i of [1,2,3,4,5]; track i) {
                <svg class="w-3.5 h-3.5" [class]="i <= getStarRating(tool.usageScore) ? 'text-amber-400' : 'text-gray-600'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              }
            </div>
            <span class="text-xs font-medium" [class]="getScoreTextClass(tool.usageScore)">
              {{ tool.usageScore }}
            </span>
          </div>

          <!-- Sentiment & Link -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full" [class]="getSentimentClass(tool.reviewSentiment)"></div>
              <span class="text-xs text-gray-500 capitalize">{{ tool.reviewSentiment }}</span>
            </div>
            <svg class="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </div>
    </a>
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
export class ToolCardComponent {
  @Input({ required: true }) tool!: MarketingTool;

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

  getCategoryColorClass(category: string): string {
    const colors: Record<string, string> = {
      'SEO': 'bg-blue-500/20',
      'Content': 'bg-purple-500/20',
      'Social': 'bg-pink-500/20',
      'Analytics': 'bg-cyan-500/20',
      'Email': 'bg-amber-500/20',
      'Ads': 'bg-red-500/20',
      'Video': 'bg-rose-500/20',
      'Design': 'bg-violet-500/20'
    };
    return colors[category] || 'bg-gray-500/20';
  }

  getStarRating(score: number): number {
    return Math.round(score / 20);
  }

  getScoreTextClass(score: number): string {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-500 shadow-lg shadow-emerald-500/50';
      case 'neutral': return 'bg-amber-500 shadow-lg shadow-amber-500/50';
      case 'negative': return 'bg-red-500 shadow-lg shadow-red-500/50';
      default: return 'bg-gray-500';
    }
  }
}
