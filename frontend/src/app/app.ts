import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsBarComponent } from './components/stats-bar/stats-bar.component';
import { CategorySectionComponent } from './components/category-section/category-section.component';
import { SyncButtonComponent } from './components/sync-button/sync-button.component';
import { NewsSectionComponent } from './components/news-section/news-section.component';
import { ToolsService } from './services/tools.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

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

  // Check if this is a shared view (no fetch buttons)
  isSharedView = signal(false);
  showShareModal = signal(false);
  shareUrl = signal('');

  categories = toSignal(
    this.toolsService.tools$.pipe(
      map(tools => {
        const grouped = this.toolsService.getToolsByCategory(tools);
        return Array.from(grouped.entries());
      })
    ),
    { initialValue: [] }
  );

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

  openShareModal(): void {
    this.showShareModal.set(true);
  }

  closeShareModal(): void {
    this.showShareModal.set(false);
  }

  copyShareUrl(): void {
    navigator.clipboard.writeText(this.shareUrl());
    // Could add a toast notification here
  }
}
