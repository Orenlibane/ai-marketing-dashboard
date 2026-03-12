import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-sync-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button (click)="fetchTools()"
              [disabled]="loading()"
              class="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              [class]="loading() ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25'">

        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>

        <!-- Content -->
        <div class="relative flex items-center gap-2">
          @if (loading()) {
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Fetching...</span>
          } @else {
            <svg class="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Fetch New Tools</span>
          }
        </div>
      </button>

      <!-- Toast notification -->
      @if (message()) {
        <div class="absolute top-full right-0 mt-3 z-50 animate-fade-in-up">
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
               [class]="success() ? 'bg-emerald-500/90 backdrop-blur-sm' : 'bg-red-500/90 backdrop-blur-sm'">
            @if (success()) {
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            } @else {
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            <span class="text-sm font-medium text-white whitespace-nowrap">{{ message() }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class SyncButtonComponent {
  private toolsService = inject(ToolsService);

  loading = signal(false);
  message = signal('');
  success = signal(false);

  fetchTools(): void {
    this.loading.set(true);
    this.message.set('');

    this.toolsService.fetchNewTools().subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(true);
        this.message.set(response.message);
        setTimeout(() => this.message.set(''), 5000);
      },
      error: (err) => {
        this.loading.set(false);
        this.success.set(false);
        this.message.set(err.error?.error || 'Failed to fetch tools');
        setTimeout(() => this.message.set(''), 5000);
      }
    });
  }
}
