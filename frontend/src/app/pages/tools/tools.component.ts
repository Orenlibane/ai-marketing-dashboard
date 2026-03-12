import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="glass-card-static p-8 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">All Tools</h1>
        <p class="text-white/50">Browse and search all marketing tools</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }
    .text-neon-purple { color: #A855F7; }
  `]
})
export class ToolsComponent {}
