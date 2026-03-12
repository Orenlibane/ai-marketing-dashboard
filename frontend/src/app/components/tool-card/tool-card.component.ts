import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketingTool } from '../../models/marketing-tool.model';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a [href]="tool.sourceUrl" target="_blank" rel="noopener noreferrer"
       class="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer">
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-gray-900">{{ tool.name }}</h3>
          @if (tool.isNewLaunch) {
            <span class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">New</span>
          }
        </div>
        <div class="flex items-center gap-2">
          <span [class]="getScoreClass(tool.usageScore)"
                class="px-2 py-0.5 text-xs font-bold rounded">
            {{ tool.usageScore }}
          </span>
          <span [class]="getSentimentClass(tool.reviewSentiment)"
                class="w-2.5 h-2.5 rounded-full">
          </span>
        </div>
      </div>
      <p class="text-sm text-gray-600 line-clamp-2">{{ tool.description }}</p>
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

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'neutral': return 'bg-yellow-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
}
