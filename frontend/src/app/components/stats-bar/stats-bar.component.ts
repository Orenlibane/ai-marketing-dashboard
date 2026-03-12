import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      @if (stats(); as s) {
        <!-- Total Tools with Progress Arc -->
        <div class="metric-card orange flex items-center gap-4 opacity-0 animate-fade-in-up delay-1">
          <div class="relative">
            <svg class="w-16 h-16" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" stroke-width="8"
                      stroke-linecap="round"
                      stroke-dasharray="251"
                      [attr.stroke-dashoffset]="0"
                      class="progress-arc"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ s.totalTools }}</div>
            <div class="text-sm text-white/70">Total Tools</div>
          </div>
        </div>

        <!-- New Launches -->
        <div class="metric-card green flex items-center gap-4 opacity-0 animate-fade-in-up delay-2">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ s.newLaunches }}</div>
            <div class="text-sm text-white/70">New Launches</div>
          </div>
        </div>

        <!-- Avg Score with Semi-Circle Gauge -->
        <div class="metric-card blue flex items-center gap-4 opacity-0 animate-fade-in-up delay-3">
          <div class="relative">
            <svg class="w-16 h-10" viewBox="0 0 100 50">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8" stroke-linecap="round"/>
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"
                    stroke-dasharray="126"
                    [attr.stroke-dashoffset]="126 - (s.avgScore / 100 * 126)"/>
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ s.avgScore }}<span class="text-lg text-white/70">%</span></div>
            <div class="text-sm text-white/70">Avg Score</div>
          </div>
        </div>

        <!-- Categories -->
        <div class="metric-card purple flex items-center gap-4 opacity-0 animate-fade-in-up delay-4">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ s.categoryCount }}</div>
            <div class="text-sm text-white/70">Categories</div>
          </div>
        </div>
      } @else {
        <!-- Skeleton Loading -->
        @for (i of [1,2,3,4]; track i) {
          <div class="metric-card bg-white/10 flex items-center gap-4 animate-pulse">
            <div class="w-14 h-14 rounded-2xl bg-white/10"></div>
            <div>
              <div class="h-8 w-16 bg-white/20 rounded mb-2"></div>
              <div class="h-4 w-20 bg-white/10 rounded"></div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .progress-arc {
      transform-origin: center;
      transform: rotate(-90deg);
    }
  `]
})
export class StatsBarComponent {
  private toolsService = inject(ToolsService);
  stats = toSignal(this.toolsService.stats$);
}
