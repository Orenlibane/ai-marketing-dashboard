import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { MarketingTool } from '../../models/marketing-tool.model';

@Component({
  selector: 'app-category-section',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  template: `
    <section class="mb-6">
      <!-- Category Header -->
      <div class="flex items-center justify-between py-4 cursor-pointer group"
           (click)="toggleExpanded()">
        <div class="flex items-center gap-3">
          <div class="category-icon" [ngClass]="getCategoryColorClass(category)">
            <span class="text-lg">{{ getCategoryIcon(category) }}</span>
          </div>
          <div>
            <h3 class="font-bold text-white group-hover:text-neon-purple transition-colors">
              {{ category }}
            </h3>
            <p class="text-xs text-white/40">{{ tools.length }} tools available</p>
          </div>
        </div>
        <button class="expand-btn" [class.expanded]="expanded()">
          <svg class="w-4 h-4 transition-transform duration-300"
               [class.rotate-180]="expanded()"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Tools List -->
      @if (expanded()) {
        <div class="tools-list">
          @for (tool of tools; track tool.id) {
            <app-tool-card [tool]="tool" />
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .category-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .category-icon.purple {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2));
    }

    .category-icon.blue {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
    }

    .category-icon.pink {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2));
    }

    .category-icon.cyan {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2));
    }

    .category-icon.amber {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
    }

    .category-icon.orange {
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2));
    }

    .expand-btn {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;
    }

    .expand-btn:hover {
      background: linear-gradient(135deg, #A855F7, #3B82F6);
      border-color: transparent;
      color: white;
      box-shadow: 0 8px 20px -6px rgba(168, 85, 247, 0.5);
    }

    .expand-btn.expanded {
      background: rgba(168, 85, 247, 0.1);
      border-color: rgba(168, 85, 247, 0.3);
      color: #A855F7;
    }

    .tools-list {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 16px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .text-neon-purple {
      color: #A855F7;
    }
  `]
})
export class CategorySectionComponent {
  @Input({ required: true }) category!: string;
  @Input({ required: true }) tools!: MarketingTool[];

  expanded = signal(true);

  toggleExpanded(): void {
    this.expanded.update(v => !v);
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
}
