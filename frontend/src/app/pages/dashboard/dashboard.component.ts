import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsBarComponent } from '../../components/stats-bar/stats-bar.component';
import { CategorySectionComponent } from '../../components/category-section/category-section.component';
import { SyncButtonComponent } from '../../components/sync-button/sync-button.component';
import { NewsSectionComponent } from '../../components/news-section/news-section.component';
import { RadarChartComponent } from '../../components/charts/radar-chart.component';
import { RingProgressComponent } from '../../components/charts/ring-progress.component';
import { AreaChartComponent } from '../../components/charts/area-chart.component';
import { ToolsService } from '../../services/tools.service';
import { toSignal } from '@angular/core/rxjs-interop';

interface CategoryFilter {
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatsBarComponent,
    CategorySectionComponent,
    SyncButtonComponent,
    NewsSectionComponent,
    RadarChartComponent,
    RingProgressComponent,
    AreaChartComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between py-6">
            <div class="flex items-center gap-4">
              <div class="logo-container">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white tracking-tight">AI Marketing Hub</h1>
                <p class="text-sm text-white/50">Discover & analyze AI-powered tools</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button (click)="openShareModal()" class="btn-glass">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              @if (!isSharedView()) {
                <app-sync-button />
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Welcome Section with Charts -->
        <section class="mb-8 animate-slide-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Statistics Card with Tabs -->
            <div class="glass-card-static p-6">
              <div class="flex items-center justify-between mb-6">
                <div class="tab-container">
                  <button
                    class="tab-pill"
                    [class.active]="activeTab() === 'statistics'"
                    (click)="setActiveTab('statistics')"
                  >
                    Statistics
                  </button>
                  <button
                    class="tab-pill"
                    [class.active]="activeTab() === 'objectives'"
                    (click)="setActiveTab('objectives')"
                  >
                    Objectives
                  </button>
                </div>
              </div>

              @if (activeTab() === 'statistics') {
                <div class="flex flex-col items-center">
                  <app-ring-progress [size]="200" [strokeWidth]="14" [showLegend]="true" />
                </div>
              } @else {
                <div class="flex flex-col items-center">
                  <app-radar-chart [size]="220" />
                </div>
              }
            </div>

            <!-- Performance Trends -->
            <div class="glass-card-static p-6 lg:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-white">Performance Trends</h3>
                  <p class="text-sm text-white/50">Weekly tool engagement</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 text-xs text-neon-purple">
                    <span class="w-2 h-2 rounded-full bg-neon-purple"></span>
                    This week
                  </span>
                </div>
              </div>
              <app-area-chart [width]="600" [height]="180" />
            </div>
          </div>
        </section>

        <!-- Stats Bar -->
        <section class="mb-6 animate-slide-up delay-1">
          <app-stats-bar />
        </section>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Tools Section -->
          <div class="lg:col-span-2 animate-slide-up delay-2">
            <div class="glass-card-static p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-xl font-bold text-white">Marketing Tools</h2>
                  <p class="text-sm text-white/50">{{ filteredToolsCount() }} tools available</p>
                </div>
                @if (hasActiveFilters()) {
                  <button (click)="clearFilters()" class="text-sm text-neon-purple hover:text-neon-pink transition-colors">
                    Clear filters
                  </button>
                }
              </div>

              <!-- Filter Chips -->
              <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-white/10">
                <button (click)="toggleNewOnly()"
                        class="filter-chip"
                        [class.active]="showNewOnly()">
                  <span>✨</span>
                  <span>New</span>
                  <span class="filter-badge">{{ newToolsCount() }}</span>
                </button>

                <div class="w-px h-8 bg-white/10 mx-1"></div>

                @for (filter of categoryFilters; track filter.name) {
                  <button (click)="toggleCategory(filter.name)"
                          class="filter-chip"
                          [class.active]="isSelected(filter.name)">
                    <span>{{ filter.icon }}</span>
                    <span>{{ filter.name }}</span>
                  </button>
                }
              </div>

              <!-- Loading State -->
              @if (loading()) {
                <div class="flex items-center justify-center py-16">
                  <div class="loader-container">
                    <div class="loader-dot"></div>
                    <div class="loader-dot"></div>
                    <div class="loader-dot"></div>
                  </div>
                </div>
              }

              <!-- Categories -->
              @for (entry of categories(); track entry[0]; let i = $index) {
                <div class="animate-fade-in-up" [style.animation-delay]="(i * 0.1) + 's'">
                  <app-category-section [category]="entry[0]" [tools]="entry[1]" />
                </div>
              }

              <!-- Empty State -->
              @if (!loading() && tools().length === 0) {
                <div class="text-center py-16">
                  <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-purple/10 flex items-center justify-center">
                    <svg class="w-10 h-10 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-white mb-2">No tools found</h3>
                  <p class="text-white/50">Click "Fetch New Tools" to discover AI marketing tools</p>
                </div>
              }
            </div>
          </div>

          <!-- News Sidebar -->
          <div class="lg:col-span-1 animate-slide-up delay-3">
            <app-news-section [isSharedView]="isSharedView()" />
          </div>
        </div>
      </main>

      <!-- Share Modal -->
      @if (showShareModal()) {
        <div class="modal-overlay" (click)="closeShareModal()">
          <div class="modal-content glass-card-static" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="text-lg font-bold text-white">Share Dashboard</h3>
              <button (click)="closeShareModal()" class="modal-close">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-white/50 mb-4">
              Share this read-only link with others.
            </p>
            <div class="flex items-center gap-2">
              <input type="text" [value]="shareUrl()" readonly class="share-input">
              <button (click)="copyShareUrl()" class="btn-neon px-4 py-3">Copy</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      position: relative;
      z-index: 1;
    }

    .dashboard-header {
      position: relative;
      z-index: 10;
    }

    .logo-container {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(135deg, #A855F7 0%, #3B82F6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px -6px rgba(168, 85, 247, 0.5);
    }

    .btn-glass {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-glass:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .filter-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      background: rgba(255, 255, 255, 0.1);
    }

    .filter-chip.active .filter-badge {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-content {
      padding: 24px;
      width: 100%;
      max-width: 420px;
      animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .modal-close {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .share-input {
      flex: 1;
      padding: 12px 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 14px;
      color: white;
    }

    .share-input:focus {
      outline: none;
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
    }

    .text-neon-purple {
      color: #A855F7;
    }

    .text-neon-pink {
      color: #EC4899;
    }

    .bg-neon-purple {
      background-color: #A855F7;
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private toolsService = inject(ToolsService);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] });
  loading = toSignal(this.toolsService.loading$, { initialValue: false });

  selectedCategories = signal<Set<string>>(new Set());
  showNewOnly = signal(false);
  isSharedView = signal(false);
  showShareModal = signal(false);
  shareUrl = signal('');
  activeTab = signal<'statistics' | 'objectives'>('statistics');

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

  newToolsCount = computed(() => {
    return this.tools().filter(tool => tool.isNewLaunch).length;
  });

  categories = computed(() => {
    const allTools = this.tools();
    const selected = this.selectedCategories();
    const newOnly = this.showNewOnly();

    let filteredTools = allTools;

    if (newOnly) {
      filteredTools = filteredTools.filter(tool => tool.isNewLaunch);
    }

    if (selected.size > 0) {
      filteredTools = filteredTools.filter(tool => selected.has(tool.category));
    }

    const grouped = this.toolsService.getToolsByCategory(filteredTools);
    return Array.from(grouped.entries());
  });

  filteredToolsCount = computed(() => {
    const selected = this.selectedCategories();
    const newOnly = this.showNewOnly();

    let count = this.tools();

    if (newOnly) {
      count = count.filter(tool => tool.isNewLaunch);
    }

    if (selected.size > 0) {
      count = count.filter(tool => selected.has(tool.category));
    }

    return count.length;
  });

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    this.isSharedView.set(urlParams.get('view') === 'shared');
    this.shareUrl.set(this.toolsService.getShareUrl());

    this.toolsService.loadTools();
    this.toolsService.loadStats();
    this.toolsService.loadNews();
  }

  setActiveTab(tab: 'statistics' | 'objectives'): void {
    this.activeTab.set(tab);
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

  toggleNewOnly(): void {
    this.showNewOnly.update(v => !v);
  }

  clearFilters(): void {
    this.selectedCategories.set(new Set());
    this.showNewOnly.set(false);
  }

  hasActiveFilters(): boolean {
    return this.selectedCategories().size > 0 || this.showNewOnly();
  }

  isSelected(category: string): boolean {
    return this.selectedCategories().has(category);
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
