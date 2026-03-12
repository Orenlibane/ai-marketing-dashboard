import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { RadarChartComponent } from '../../components/charts/radar-chart.component';
import { RingProgressComponent } from '../../components/charts/ring-progress.component';
import { AreaChartComponent } from '../../components/charts/area-chart.component';
import { ToolsService } from '../../services/tools.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

interface WeeklyInsight {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface TopTool {
  name: string;
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface CategoryTrend {
  name: string;
  tools: number;
  avgScore: number;
  trend: number;
  icon: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, RadarChartComponent, RingProgressComponent, AreaChartComponent],
  template: `
    <div class="page-container">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p class="text-white/50">Last Week AI Marketing Tools Analysis</p>
        </div>
        <button (click)="refreshAnalysis()" [disabled]="analyzing()" class="refresh-btn">
          <svg class="w-5 h-5" [class.animate-spin]="analyzing()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ analyzing() ? 'Analyzing...' : 'Refresh Analysis' }}
        </button>
      </header>

      <!-- Weekly Insights Summary -->
      <div class="insights-grid mb-8">
        @for (insight of weeklyInsights(); track insight.title) {
          <div class="glass-card-static insight-card">
            <div class="insight-icon" [style.background]="insight.color">
              <span class="text-2xl">{{ insight.icon }}</span>
            </div>
            <div class="insight-content">
              <span class="insight-label">{{ insight.title }}</span>
              <span class="insight-value">{{ insight.value }}</span>
            </div>
            <div class="insight-change" [class.positive]="insight.change > 0" [class.negative]="insight.change < 0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (insight.change > 0) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                } @else if (insight.change < 0) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                }
              </svg>
              <span>{{ insight.change > 0 ? '+' : '' }}{{ insight.change }}%</span>
            </div>
          </div>
        }
      </div>

      <!-- AI Weekly Summary -->
      <div class="glass-card-static p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2">
            <span class="text-purple-400">🤖</span>
            AI Weekly Summary
          </h3>
          <span class="text-xs text-white/40">Week of {{ getWeekRange() }}</span>
        </div>
        @if (weeklySummary()) {
          <div class="summary-content">
            <p class="text-white/70 leading-relaxed">{{ weeklySummary() }}</p>
          </div>
        } @else {
          <div class="flex items-center gap-3 text-white/50">
            <div class="animate-pulse w-full h-4 bg-white/10 rounded"></div>
          </div>
        }
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="glass-card-static p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Tool Usage Distribution</h3>
          <app-ring-progress [size]="220" [strokeWidth]="16" />
        </div>

        <div class="glass-card-static p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Category Performance</h3>
          <app-radar-chart [size]="250" />
        </div>

        <div class="glass-card-static p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Weekly Trends</h3>
          <app-area-chart [width]="350" [height]="200" />
        </div>
      </div>

      <!-- Top Tools & Category Trends -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Performing Tools This Week -->
        <div class="glass-card-static p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span class="text-yellow-400">🏆</span>
            Top Performing Tools This Week
          </h3>
          <div class="top-tools-list">
            @for (tool of topTools(); track tool.name; let i = $index) {
              <div class="top-tool-item">
                <span class="rank" [class]="'rank-' + (i + 1)">{{ i + 1 }}</span>
                <div class="tool-info">
                  <span class="tool-name">{{ tool.name }}</span>
                  <span class="tool-category">{{ tool.category }}</span>
                </div>
                <div class="tool-score">
                  <span class="score">{{ tool.score }}</span>
                  <div class="trend" [class]="tool.trend">
                    @if (tool.trend === 'up') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    } @else if (tool.trend === 'down') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                      </svg>
                    }
                    <span>{{ tool.change > 0 ? '+' : '' }}{{ tool.change }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Category Trends -->
        <div class="glass-card-static p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span class="text-blue-400">📊</span>
            Category Trends
          </h3>
          <div class="category-trends-list">
            @for (cat of categoryTrends(); track cat.name) {
              <div class="category-item">
                <span class="category-icon">{{ cat.icon }}</span>
                <div class="category-info">
                  <span class="category-name">{{ cat.name }}</span>
                  <span class="category-stats">{{ cat.tools }} tools · Avg {{ cat.avgScore }}</span>
                </div>
                <div class="category-trend" [class.positive]="cat.trend > 0" [class.negative]="cat.trend < 0">
                  <span>{{ cat.trend > 0 ? '+' : '' }}{{ cat.trend }}%</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
      padding-bottom: 100px;
    }

    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #A855F7, #3B82F6);
      color: white;
      font-weight: 600;
      font-size: 14px;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .refresh-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
    }

    .refresh-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .insight-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .insight-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .insight-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .insight-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }

    .insight-value {
      font-size: 24px;
      font-weight: 700;
      color: white;
    }

    .insight-change {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
    }

    .insight-change.positive {
      background: rgba(74, 222, 128, 0.1);
      color: #4ade80;
    }

    .insight-change.negative {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
    }

    .summary-content {
      padding: 16px;
      background: rgba(168, 85, 247, 0.05);
      border-radius: 12px;
      border-left: 3px solid #A855F7;
    }

    .top-tools-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .top-tool-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      transition: all 0.2s;
    }

    .top-tool-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .rank {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
    }

    .rank-1 {
      background: linear-gradient(135deg, #F59E0B, #FBBF24);
      color: white;
    }

    .rank-2 {
      background: linear-gradient(135deg, #9CA3AF, #D1D5DB);
      color: #1F2937;
    }

    .rank-3 {
      background: linear-gradient(135deg, #CD7F32, #DDA15E);
      color: white;
    }

    .tool-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tool-name {
      font-weight: 600;
      color: white;
      font-size: 14px;
    }

    .tool-category {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }

    .tool-score {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .score {
      font-size: 20px;
      font-weight: 700;
      color: white;
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .trend.up {
      color: #4ade80;
    }

    .trend.down {
      color: #f87171;
    }

    .trend.stable {
      color: rgba(255, 255, 255, 0.5);
    }

    .category-trends-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      transition: all 0.2s;
    }

    .category-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .category-icon {
      font-size: 24px;
    }

    .category-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .category-name {
      font-weight: 600;
      color: white;
      font-size: 14px;
    }

    .category-stats {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }

    .category-trend {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
    }

    .category-trend.positive {
      background: rgba(74, 222, 128, 0.1);
      color: #4ade80;
    }

    .category-trend.negative {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
    }

    /* Tablet */
    @media (max-width: 1024px) {
      .insights-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
        padding-bottom: 80px;
      }

      .page-container > header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        margin-bottom: 24px;
      }

      .page-container > header h1 {
        font-size: 1.5rem;
      }

      .page-container > header p {
        font-size: 0.875rem;
      }

      .refresh-btn {
        padding: 10px 16px;
        font-size: 13px;
        justify-content: center;
      }

      .insights-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .insight-card {
        padding: 16px;
        gap: 12px;
      }

      .insight-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
      }

      .insight-icon span {
        font-size: 1.25rem;
      }

      .insight-label {
        font-size: 12px;
      }

      .insight-value {
        font-size: 20px;
      }

      .insight-change {
        padding: 4px 8px;
        font-size: 12px;
      }

      .glass-card-static.p-6 {
        padding: 16px;
      }

      .glass-card-static h3 {
        font-size: 1rem;
        margin-bottom: 12px;
      }

      .summary-content {
        padding: 12px;
      }

      .summary-content p {
        font-size: 13px;
        line-height: 1.6;
      }

      .top-tools-list,
      .category-trends-list {
        gap: 10px;
      }

      .top-tool-item,
      .category-item {
        padding: 10px 12px;
        gap: 12px;
      }

      .rank {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }

      .tool-name,
      .category-name {
        font-size: 13px;
      }

      .tool-category,
      .category-stats {
        font-size: 11px;
      }

      .score {
        font-size: 16px;
      }

      .tool-score {
        gap: 8px;
      }

      .trend {
        font-size: 11px;
      }

      .trend svg {
        width: 12px;
        height: 12px;
      }

      .category-icon {
        font-size: 20px;
      }

      .category-trend {
        padding: 4px 10px;
        font-size: 12px;
      }
    }

    /* Small Mobile */
    @media (max-width: 480px) {
      .page-container {
        padding: 12px;
        padding-bottom: 70px;
      }

      .page-container > header h1 {
        font-size: 1.25rem;
      }

      .page-container > header p {
        font-size: 0.75rem;
      }

      .refresh-btn {
        padding: 10px 14px;
        font-size: 12px;
        border-radius: 10px;
      }

      .refresh-btn svg {
        width: 16px;
        height: 16px;
      }

      .insight-card {
        padding: 14px;
        gap: 10px;
      }

      .insight-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }

      .insight-icon span {
        font-size: 1rem;
      }

      .insight-value {
        font-size: 18px;
      }

      .glass-card-static.p-6 {
        padding: 14px;
      }

      .top-tool-item,
      .category-item {
        padding: 10px;
        gap: 10px;
        border-radius: 10px;
      }

      .rank {
        width: 24px;
        height: 24px;
        font-size: 11px;
        border-radius: 6px;
      }

      .score {
        font-size: 14px;
      }

      .category-icon {
        font-size: 18px;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private toolsService = inject(ToolsService);
  private http = inject(HttpClient);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] });
  analyzing = signal(false);
  weeklySummary = signal('');

  weeklyInsights = signal<WeeklyInsight[]>([
    { title: 'New Tools Added', value: '12', change: 15, icon: '🚀', color: 'linear-gradient(135deg, #A855F7, #7C3AED)' },
    { title: 'Avg Usage Score', value: '78.5', change: 3, icon: '📈', color: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
    { title: 'Top Category', value: 'Content AI', change: 8, icon: '✍️', color: 'linear-gradient(135deg, #10B981, #059669)' },
    { title: 'User Favorites', value: '156', change: -2, icon: '⭐', color: 'linear-gradient(135deg, #F59E0B, #D97706)' }
  ]);

  topTools = computed<TopTool[]>(() => {
    const allTools = this.tools();
    if (allTools.length === 0) {
      return [
        { name: 'ChatGPT', category: 'Content', score: 95, trend: 'up', change: 5 },
        { name: 'Jasper AI', category: 'Content', score: 92, trend: 'up', change: 3 },
        { name: 'Midjourney', category: 'Design', score: 90, trend: 'stable', change: 0 },
        { name: 'Copy.ai', category: 'Content', score: 88, trend: 'up', change: 7 },
        { name: 'Surfer SEO', category: 'SEO', score: 86, trend: 'down', change: -2 }
      ];
    }

    return allTools
      .slice()
      .sort((a, b) => b.usageScore - a.usageScore)
      .slice(0, 5)
      .map((tool, index) => ({
        name: tool.name,
        category: tool.category,
        score: tool.usageScore,
        trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'stable' : 'down' as 'up' | 'down' | 'stable',
        change: Math.floor(Math.random() * 10) - 3
      }));
  });

  categoryTrends = signal<CategoryTrend[]>([
    { name: 'Content AI', tools: 24, avgScore: 85, trend: 12, icon: '✍️' },
    { name: 'SEO Tools', tools: 18, avgScore: 78, trend: 5, icon: '🔍' },
    { name: 'Design AI', tools: 15, avgScore: 82, trend: 8, icon: '🎨' },
    { name: 'Video AI', tools: 12, avgScore: 76, trend: -3, icon: '🎬' },
    { name: 'Analytics', tools: 10, avgScore: 80, trend: 2, icon: '📊' },
    { name: 'Social Media', tools: 14, avgScore: 74, trend: -1, icon: '📱' }
  ]);

  ngOnInit(): void {
    this.toolsService.loadTools();
    this.generateWeeklySummary();
  }

  getWeekRange(): string {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekAgo.toLocaleDateString('en-US', options)} - ${now.toLocaleDateString('en-US', options)}`;
  }

  generateWeeklySummary(): void {
    this.weeklySummary.set(
      'This week saw significant growth in AI-powered content creation tools, with ChatGPT maintaining its lead position. ' +
      'Content AI tools showed the strongest category growth at 12%, driven by new features in text generation and editing. ' +
      'Video AI tools experienced a slight decline (-3%) as the market consolidates around key players. ' +
      'Notable new entries include advanced SEO analyzers with AI-driven recommendations and multi-platform social media schedulers.'
    );
  }

  refreshAnalysis(): void {
    this.analyzing.set(true);
    this.weeklySummary.set('');

    this.http.post<{ summary: string }>(`${environment.apiUrl}/api/analytics/weekly-summary`, {}).subscribe({
      next: (response) => {
        this.weeklySummary.set(response.summary);
        this.analyzing.set(false);
      },
      error: () => {
        this.generateWeeklySummary();
        this.analyzing.set(false);
      }
    });
  }
}
