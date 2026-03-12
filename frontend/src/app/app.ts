import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsBarComponent } from './components/stats-bar/stats-bar.component';
import { CategorySectionComponent } from './components/category-section/category-section.component';
import { SyncButtonComponent } from './components/sync-button/sync-button.component';
import { NewsSectionComponent } from './components/news-section/news-section.component';
import { ToolsService } from './services/tools.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

interface CategoryFilter {
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, StatsBarComponent, CategorySectionComponent, SyncButtonComponent, NewsSectionComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private toolsService = inject(ToolsService);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] });
  loading = toSignal(this.toolsService.loading$, { initialValue: false });

  // Filter state
  selectedCategories = signal<Set<string>>(new Set());

  // Available category filters
  categoryFilters: CategoryFilter[] = [
    { name: 'SEO', icon: '🔍', color: 'blue' },
    { name: 'Content', icon: '✍️', color: 'purple' },
    { name: 'Social', icon: '📱', color: 'pink' },
    { name: 'Analytics', icon: '📊', color: 'cyan' },
    { name: 'Email', icon: '📧', color: 'amber' },
    { name: 'Ads', icon: '📢', color: 'orange' },
    { name: 'Video', icon: '🎬', color: 'rose' },
    { name: 'Design', icon: '🎨', color: 'violet' }
  ];

  // Check if this is a shared view (no fetch buttons)
  isSharedView = signal(false);
  showShareModal = signal(false);
  shareUrl = signal('');

  // Filtered categories based on selection
  categories = computed(() => {
    const allTools = this.tools();
    const selected = this.selectedCategories();

    // If no filter selected, show all
    const filteredTools = selected.size === 0
      ? allTools
      : allTools.filter(tool => selected.has(tool.category));

    const grouped = this.toolsService.getToolsByCategory(filteredTools);
    return Array.from(grouped.entries());
  });

  // Count of filtered tools
  filteredToolsCount = computed(() => {
    const selected = this.selectedCategories();
    if (selected.size === 0) return this.tools().length;
    return this.tools().filter(tool => selected.has(tool.category)).length;
  });

  ngOnInit(): void {
    // Check for shared view parameter
    const urlParams = new URLSearchParams(window.location.search);
    this.isSharedView.set(urlParams.get('view') === 'shared');

    // Generate share URL
    this.shareUrl.set(this.toolsService.getShareUrl());

    this.toolsService.loadTools();
    this.toolsService.loadStats();
    this.toolsService.loadNews();
  }

  toggleCategory(category: string): void {
    this.selectedCategories.update(current => {
      const newSet = new Set(current);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }

  clearFilters(): void {
    this.selectedCategories.set(new Set());
  }

  isSelected(category: string): boolean {
    return this.selectedCategories().has(category);
  }

  getFilterColorClass(color: string, isSelected: boolean): string {
    if (isSelected) {
      const activeColors: Record<string, string> = {
        'blue': 'bg-blue-500 text-white border-blue-500',
        'purple': 'bg-purple-500 text-white border-purple-500',
        'pink': 'bg-pink-500 text-white border-pink-500',
        'cyan': 'bg-cyan-500 text-white border-cyan-500',
        'amber': 'bg-amber-500 text-white border-amber-500',
        'orange': 'bg-orange-500 text-white border-orange-500',
        'rose': 'bg-rose-500 text-white border-rose-500',
        'violet': 'bg-violet-500 text-white border-violet-500'
      };
      return activeColors[color] || 'bg-gray-500 text-white';
    }
    return 'bg-white text-gray-600 border-gray-200 hover:border-gray-300';
  }

  openShareModal(): void {
    this.showShareModal.set(true);
  }

  closeShareModal(): void {
    this.showShareModal.set(false);
  }

  copyShareUrl(): void {
    navigator.clipboard.writeText(this.shareUrl());
  }
}
