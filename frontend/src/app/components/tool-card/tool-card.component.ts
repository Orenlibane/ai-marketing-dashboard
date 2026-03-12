import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketingTool } from '../../models/marketing-tool.model';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a [href]="tool.sourceUrl" target="_blank" rel="noopener noreferrer"
       class="list-item group cursor-pointer hover:bg-gray-50 rounded-xl -mx-2 px-4">

      <!-- Icon -->
      <div class="icon-circle mr-4" [ngClass]="getCategoryColorClass(tool.category)">
        <span class="text-lg">{{ getCategoryIcon(tool.category) }}</span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-semibold text-[#1A253D] truncate">{{ tool.name }}</h3>
          @if (tool.isNewLaunch) {
            <span class="badge-new">NEW</span>
          }
        </div>
        <p class="text-sm text-gray-500 line-clamp-1">{{ tool.description }}</p>
      </div>

      <!-- Score & Arrow -->
      <div class="flex items-center gap-4 ml-4">
        <!-- Score Badge -->
        <div class="text-center">
          <div class="text-lg font-bold" [ngClass]="getScoreClass(tool.usageScore)">
            {{ tool.usageScore }}
          </div>
          <div class="text-xs text-gray-400">Score</div>
        </div>

        <!-- Sentiment Dot -->
        <div class="w-3 h-3 rounded-full" [ngClass]="getSentimentClass(tool.reviewSentiment)"></div>

        <!-- Arrow -->
        <svg class="w-5 h-5 text-gray-300 group-hover:text-[#FF5722] group-hover:translate-x-1 transition-all"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
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
      'SEO': 'blue',
      'Content': 'purple',
      'Social': 'pink',
      'Analytics': 'cyan',
      'Email': 'amber',
      'Ads': 'orange',
      'Video': 'pink',
      'Design': 'purple'
    };
    return colors[category] || 'blue';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return 'bg-[#4CAF50]';
      case 'neutral': return 'bg-[#FFC107]';
      case 'negative': return 'bg-[#F44336]';
      default: return 'bg-gray-400';
    }
  }
}
