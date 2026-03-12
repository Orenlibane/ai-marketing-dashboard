import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadarChartComponent } from '../../components/charts/radar-chart.component';
import { RingProgressComponent } from '../../components/charts/ring-progress.component';
import { AreaChartComponent } from '../../components/charts/area-chart.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RadarChartComponent, RingProgressComponent, AreaChartComponent],
  template: `
    <div class="page-container">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p class="text-white/50">Track your marketing performance</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Ring Progress Card -->
        <div class="glass-card-static p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Tool Usage Distribution</h3>
          <app-ring-progress [size]="220" [strokeWidth]="16" />
        </div>

        <!-- Radar Chart Card -->
        <div class="glass-card-static p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Category Performance</h3>
          <app-radar-chart [size]="250" />
        </div>

        <!-- Area Chart Card -->
        <div class="glass-card-static p-6 lg:col-span-1">
          <h3 class="text-lg font-semibold text-white mb-4">Weekly Trends</h3>
          <app-area-chart [width]="350" [height]="200" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }
  `]
})
export class AnalyticsComponent {}
