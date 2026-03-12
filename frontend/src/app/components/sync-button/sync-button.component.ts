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
              class="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        @if (loading()) {
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Fetching...</span>
        } @else {
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Fetch New Tools</span>
        }
      </button>

      <!-- Toast notification -->
      @if (message()) {
        <div class="absolute top-full right-0 mt-3 z-50 animate-fade-in-up">
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
               [class]="success() ? 'bg-[#4CAF50]' : 'bg-[#F44336]'">
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
