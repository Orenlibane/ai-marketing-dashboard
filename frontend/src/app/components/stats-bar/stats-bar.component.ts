import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      @if (stats(); as s) {
        <!-- Total Tools -->
        <div class="glass-card rounded-2xl p-6 group animate-fade-in-up opacity-0 stagger-1">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span class="badge badge-info">Total</span>
          </div>
          <div class="text-4xl font-bold text-white mb-1">{{ s.totalTools }}</div>
          <div class="text-sm text-gray-400">Marketing Tools</div>
          <div class="mt-4 h-1.5 progress-bar">
            <div class="progress-fill bg-gradient-to-r from-blue-500 to-cyan-400" style="width: 100%"></div>
          </div>
        </div>

        <!-- New Launches -->
        <div class="glass-card rounded-2xl p-6 group animate-fade-in-up opacity-0 stagger-2">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span class="badge badge-success">New</span>
          </div>
          <div class="text-4xl font-bold text-white mb-1">{{ s.newLaunches }}</div>
          <div class="text-sm text-gray-400">New Launches</div>
          <div class="mt-4 h-1.5 progress-bar">
            <div class="progress-fill bg-gradient-to-r from-emerald-500 to-green-400"
                 [style.width]="(s.newLaunches / s.totalTools * 100) + '%'"></div>
          </div>
        </div>

        <!-- Average Score -->
        <div class="glass-card rounded-2xl p-6 group animate-fade-in-up opacity-0 stagger-3">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span class="badge badge-warning">Score</span>
          </div>
          <div class="text-4xl font-bold text-white mb-1">{{ s.avgScore }}<span class="text-xl text-gray-400">/100</span></div>
          <div class="text-sm text-gray-400">Average Score</div>
          <div class="mt-4 h-1.5 progress-bar">
            <div class="progress-fill bg-gradient-to-r from-purple-500 to-violet-400"
                 [style.width]="s.avgScore + '%'"></div>
          </div>
        </div>

        <!-- Categories -->
        <div class="glass-card rounded-2xl p-6 group animate-fade-in-up opacity-0 stagger-4">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span class="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30">Categories</span>
          </div>
          <div class="text-4xl font-bold text-white mb-1">{{ s.categoryCount }}</div>
          <div class="text-sm text-gray-400">Tool Categories</div>
          <div class="mt-4 flex gap-1.5">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="flex-1 h-1.5 rounded-full"
                   [class]="i <= s.categoryCount ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-white/10'"></div>
            }
          </div>
        </div>
      } @else {
        <!-- Skeleton Loading -->
        @for (i of [1,2,3,4]; track i) {
          <div class="glass-card rounded-2xl p-6 animate-pulse">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl skeleton"></div>
              <div class="w-16 h-6 rounded-full skeleton"></div>
            </div>
            <div class="h-10 w-20 skeleton mb-2"></div>
            <div class="h-4 w-28 skeleton"></div>
            <div class="mt-4 h-1.5 skeleton"></div>
          </div>
        }
      }
    </div>
  `
})
export class StatsBarComponent {
  private toolsService = inject(ToolsService);
  stats = toSignal(this.toolsService.stats$);
}
