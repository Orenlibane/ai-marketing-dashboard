import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-sync-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="fetchTools()"
            [disabled]="loading()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
    @if (message()) {
      <p [class]="success() ? 'text-green-600' : 'text-red-600'" class="mt-2 text-sm">
        {{ message() }}
      </p>
    }
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
