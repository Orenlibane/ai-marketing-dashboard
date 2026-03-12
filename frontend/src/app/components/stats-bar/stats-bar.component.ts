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
        <!-- Total Tools -->
        <div class="stat-card-glass animate-fade-in-up delay-1">
          <div class="stat-icon purple">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value gradient-text-purple">{{ s.totalTools }}</div>
            <div class="stat-label">Total Tools</div>
          </div>
          <div class="stat-ring">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(168, 85, 247, 0.2)" stroke-width="3"/>
              <circle cx="18" cy="18" r="15" fill="none" stroke="url(#purpleGrad)" stroke-width="3"
                      stroke-linecap="round" stroke-dasharray="94" stroke-dashoffset="0"
                      style="transform: rotate(-90deg); transform-origin: center;"/>
            </svg>
          </div>
        </div>

        <!-- New Launches -->
        <div class="stat-card-glass animate-fade-in-up delay-2">
          <div class="stat-icon green">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value gradient-text-green">{{ s.newLaunches }}</div>
            <div class="stat-label">New Launches</div>
          </div>
          <div class="stat-badge">
            <span class="badge-glow green">+{{ s.newLaunches }}</span>
          </div>
        </div>

        <!-- Avg Score -->
        <div class="stat-card-glass animate-fade-in-up delay-3">
          <div class="stat-icon blue">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value gradient-text-blue">{{ s.avgScore }}<span class="stat-unit">%</span></div>
            <div class="stat-label">Avg Score</div>
          </div>
          <div class="stat-gauge">
            <svg viewBox="0 0 100 50">
              <path d="M 10 45 A 35 35 0 0 1 90 45" fill="none" stroke="rgba(59, 130, 246, 0.2)" stroke-width="6" stroke-linecap="round"/>
              <path d="M 10 45 A 35 35 0 0 1 90 45" fill="none" stroke="url(#blueGrad)" stroke-width="6" stroke-linecap="round"
                    stroke-dasharray="110" [attr.stroke-dashoffset]="110 - (s.avgScore / 100 * 110)"/>
            </svg>
          </div>
        </div>

        <!-- Categories -->
        <div class="stat-card-glass animate-fade-in-up delay-4">
          <div class="stat-icon cyan">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value gradient-text-cyan">{{ s.categoryCount }}</div>
            <div class="stat-label">Categories</div>
          </div>
          <div class="stat-dots">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <span class="dot" [class.active]="i <= s.categoryCount"></span>
            }
          </div>
        </div>
      } @else {
        <!-- Skeleton Loading -->
        @for (i of [1,2,3,4]; track i) {
          <div class="stat-card-glass animate-pulse">
            <div class="skeleton w-12 h-12 rounded-xl"></div>
            <div class="stat-content">
              <div class="skeleton h-8 w-16 rounded-lg mb-2"></div>
              <div class="skeleton h-4 w-24 rounded-lg"></div>
            </div>
          </div>
        }
      }
    </div>

    <!-- SVG Gradients -->
    <svg style="width: 0; height: 0; position: absolute;">
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #A855F7" />
          <stop offset="100%" style="stop-color: #EC4899" />
        </linearGradient>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #3B82F6" />
          <stop offset="100%" style="stop-color: #06B6D4" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #10B981" />
          <stop offset="100%" style="stop-color: #059669" />
        </linearGradient>
        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #06B6D4" />
          <stop offset="100%" style="stop-color: #0891B2" />
        </linearGradient>
      </defs>
    </svg>
  `,
  styles: [`
    .stat-card-glass {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .stat-card-glass:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon.purple {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
      color: #A855F7;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
    }

    .stat-icon.green {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
      color: #10B981;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
    }

    .stat-icon.blue {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2));
      color: #3B82F6;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    }

    .stat-icon.cyan {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2));
      color: #06B6D4;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
    }

    .stat-content {
      flex: 1;
      min-width: 0;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-unit {
      font-size: 16px;
      opacity: 0.7;
    }

    .stat-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
    }

    .gradient-text-purple {
      background: linear-gradient(135deg, #A855F7, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-text-green {
      background: linear-gradient(135deg, #10B981, #059669);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-text-blue {
      background: linear-gradient(135deg, #3B82F6, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-text-cyan {
      background: linear-gradient(135deg, #06B6D4, #0891B2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-ring {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
    }

    .stat-badge {
      position: absolute;
      top: 12px;
      right: 12px;
    }

    .badge-glow {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    .badge-glow.green {
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .stat-gauge {
      position: absolute;
      bottom: 12px;
      right: 12px;
      width: 50px;
      height: 25px;
    }

    .stat-dots {
      position: absolute;
      bottom: 16px;
      right: 16px;
      display: flex;
      gap: 4px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .dot.active {
      background: #06B6D4;
      box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
    }
  `]
})
export class StatsBarComponent {
  private toolsService = inject(ToolsService);
  stats = toSignal(this.toolsService.stats$);
}
