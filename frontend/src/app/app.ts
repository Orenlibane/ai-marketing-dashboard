import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsBarComponent } from './components/stats-bar/stats-bar.component';
import { CategorySectionComponent } from './components/category-section/category-section.component';
import { SyncButtonComponent } from './components/sync-button/sync-button.component';
import { ToolsService } from './services/tools.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, StatsBarComponent, CategorySectionComponent, SyncButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private toolsService = inject(ToolsService);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] });
  loading = toSignal(this.toolsService.loading$, { initialValue: false });

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
    this.toolsService.loadTools();
    this.toolsService.loadStats();
  }
}
