import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { MarketingTool } from '../../models/marketing-tool.model';

@Component({
  selector: 'app-category-section',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  template: `
    <section class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl">{{ getCategoryIcon(category) }}</span>
        <h2 class="text-xl font-bold text-gray-800">{{ category }}</h2>
        <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          {{ tools.length }} tools
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (tool of tools; track tool.id) {
          <app-tool-card [tool]="tool" />
        }
      </div>
    </section>
  `
})
export class CategorySectionComponent {
  @Input({ required: true }) category!: string;
  @Input({ required: true }) tools!: MarketingTool[];

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
}
