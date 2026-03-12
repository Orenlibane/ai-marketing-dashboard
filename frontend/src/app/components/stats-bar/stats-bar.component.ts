import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      @if (stats(); as s) {
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-3xl font-bold text-blue-600">{{ s.totalTools }}</div>
          <div class="text-sm text-gray-500">Total Tools</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-3xl font-bold text-green-600">{{ s.newLaunches }}</div>
          <div class="text-sm text-gray-500">New Launches</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-3xl font-bold text-purple-600">{{ s.avgScore }}</div>
          <div class="text-sm text-gray-500">Avg Score</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-3xl font-bold text-orange-600">{{ s.categoryCount }}</div>
          <div class="text-sm text-gray-500">Categories</div>
        </div>
      } @else {
        @for (i of [1,2,3,4]; track i) {
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
            <div class="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div class="h-4 bg-gray-100 rounded w-20"></div>
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
