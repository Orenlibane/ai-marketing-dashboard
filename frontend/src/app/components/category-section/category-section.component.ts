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
          <div class="icon-circle" [ngClass]="getCategoryColorClass(category)">
            <span class="text-lg">{{ getCategoryIcon(category) }}</span>
          </div>
          <div>
            <h3 class="font-bold text-[#1A253D] group-hover:text-[#FF5722] transition-colors">
              {{ category }}
            </h3>
            <p class="text-xs text-gray-400">{{ tools.length }} tools available</p>
          </div>
        </div>
        <button class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#FF5722] hover:text-white transition-all">
          <svg class="w-4 h-4 transition-transform duration-300"
               [class.rotate-180]="expanded()"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Tools List -->
      @if (expanded()) {
        <div class="bg-gray-50/50 rounded-2xl py-2">
          @for (tool of tools; track tool.id) {
            <app-tool-card [tool]="tool" />
          }
        </div>
      }
    </section>
  `
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
