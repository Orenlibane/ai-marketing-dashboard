import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { MarketingTool } from '../../models/marketing-tool.model';

@Component({
  selector: 'app-category-section',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  template: `
    <section class="mb-10">
      <!-- Category Header -->
      <div class="flex items-center justify-between mb-6 cursor-pointer group"
           (click)="toggleExpanded()">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
               [class]="getCategoryGradient(category)">
            {{ getCategoryIcon(category) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              {{ category }}
            </h2>
            <p class="text-sm text-gray-500">{{ getCategoryDescription(category) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1.5 text-sm font-medium rounded-full glass-light text-gray-300">
            {{ tools.length }} tools
          </span>
          <button class="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5 transition-transform duration-300"
                 [class.rotate-180]="expanded()"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Tools Grid -->
      @if (expanded()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          @for (tool of tools; track tool.id; let i = $index) {
            <div class="animate-fade-in-up opacity-0" [style.animation-delay]="(i * 0.05) + 's'">
              <app-tool-card [tool]="tool" />
            </div>
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

  getCategoryGradient(category: string): string {
    const gradients: Record<string, string> = {
      'SEO': 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      'Content': 'bg-gradient-to-br from-purple-500/20 to-violet-500/20',
      'Social': 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
      'Analytics': 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20',
      'Email': 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
      'Ads': 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
      'Video': 'bg-gradient-to-br from-rose-500/20 to-pink-500/20',
      'Design': 'bg-gradient-to-br from-violet-500/20 to-purple-500/20'
    };
    return gradients[category] || 'bg-gradient-to-br from-gray-500/20 to-slate-500/20';
  }

  getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'SEO': 'Search engine optimization tools',
      'Content': 'Content creation & writing tools',
      'Social': 'Social media management tools',
      'Analytics': 'Data analytics & insights tools',
      'Email': 'Email marketing automation',
      'Ads': 'Advertising & PPC management',
      'Video': 'Video creation & editing tools',
      'Design': 'Design & visual creation tools'
    };
    return descriptions[category] || 'Marketing tools';
  }
}
