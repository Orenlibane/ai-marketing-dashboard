import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketingTool } from '../../models/marketing-tool.model';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a [routerLink]="['/tools', tool.id]"
       class="tool-card-glass group cursor-pointer">

      <!-- Icon -->
      <div class="tool-icon" [ngClass]="getCategoryColorClass(tool.category)">
        <span class="text-xl">{{ getCategoryIcon(tool.category) }}</span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-semibold text-white truncate group-hover:text-neon-purple transition-colors">
            {{ tool.name }}
          </h3>
          @if (tool.isNewLaunch) {
            <span class="badge-new">NEW</span>
          }
        </div>
        <p class="text-sm text-white/50 line-clamp-1">{{ tool.description }}</p>
      </div>

      <!-- Score & Arrow -->
      <div class="flex items-center gap-4 ml-4">
        <!-- Score Badge -->
        <div class="text-center">
          <div class="score-badge" [ngClass]="getScoreClass(tool.usageScore)">
            {{ tool.usageScore }}
          </div>
          <div class="text-xs text-white/40 mt-1">Score</div>
        </div>

        <!-- Sentiment Dot -->
        <div class="sentiment-dot" [ngClass]="getSentimentClass(tool.reviewSentiment)"></div>

        <!-- Arrow -->
        <svg class="w-5 h-5 text-white/30 group-hover:text-neon-purple group-hover:translate-x-1 transition-all"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  `,
  styles: [`
    .tool-card-glass {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tool-card-glass:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(168, 85, 247, 0.3);
      transform: translateX(4px);
      box-shadow: 0 8px 24px -6px rgba(168, 85, 247, 0.2);
    }

    .tool-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tool-icon.purple {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2));
    }

    .tool-icon.blue {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
    }

    .tool-icon.pink {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2));
    }

    .tool-icon.cyan {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2));
    }

    .tool-icon.amber {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
    }

    .tool-icon.orange {
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2));
    }

    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .score-badge {
      font-size: 16px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
    }

    .score-badge.high {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
      color: #10B981;
    }

    .score-badge.medium {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
      color: #F59E0B;
    }

    .score-badge.low {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
      color: #EF4444;
    }

    .sentiment-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .sentiment-dot.positive {
      background: #10B981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }

    .sentiment-dot.neutral {
      background: #F59E0B;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
    }

    .sentiment-dot.negative {
      background: #EF4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
    }

    .text-neon-purple {
      color: #A855F7;
    }

    .badge-new {
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 600;
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      border-radius: 10px;
      flex-shrink: 0;
    }

    /* Tablet */
    @media (max-width: 768px) {
      .tool-card-glass {
        padding: 14px 16px;
        gap: 12px;
        border-radius: 14px;
      }

      .tool-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }

      .tool-icon span {
        font-size: 1rem;
      }

      .score-badge {
        font-size: 14px;
        padding: 3px 8px;
      }

      .sentiment-dot {
        width: 8px;
        height: 8px;
      }
    }

    /* Mobile */
    @media (max-width: 480px) {
      .tool-card-glass {
        padding: 12px;
        gap: 10px;
        border-radius: 12px;
        flex-wrap: wrap;
      }

      .tool-card-glass:hover {
        transform: none;
      }

      .tool-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
      }

      .tool-icon span {
        font-size: 0.875rem;
      }

      .flex-1 {
        flex: 1;
        min-width: 0;
      }

      .flex-1 h3 {
        font-size: 14px;
      }

      .flex-1 p {
        font-size: 12px;
      }

      .badge-new {
        padding: 2px 6px;
        font-size: 9px;
      }

      .tool-card-glass > .flex:last-child {
        gap: 8px;
        margin-left: 0;
      }

      .score-badge {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 6px;
      }

      .text-xs {
        font-size: 10px;
      }

      .sentiment-dot {
        display: none;
      }

      .tool-card-glass svg:last-child {
        width: 16px;
        height: 16px;
      }
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
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  getSentimentClass(sentiment: string): string {
    return sentiment || 'neutral';
  }
}
