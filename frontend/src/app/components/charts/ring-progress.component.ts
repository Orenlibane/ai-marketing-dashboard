import { Component, Input, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RingSegment {
  label: string;
  value: number;
  color: 'purple' | 'blue' | 'cyan' | 'pink' | 'green';
}

@Component({
  selector: 'app-ring-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ring-progress-container">
      <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #A855F7" />
            <stop offset="100%" style="stop-color: #EC4899" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #3B82F6" />
            <stop offset="100%" style="stop-color: #06B6D4" />
          </linearGradient>
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #06B6D4" />
            <stop offset="100%" style="stop-color: #10B981" />
          </linearGradient>
          <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #EC4899" />
            <stop offset="100%" style="stop-color: #F43F5E" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #10B981" />
            <stop offset="100%" style="stop-color: #059669" />
          </linearGradient>
        </defs>

        @for (ring of rings(); track ring.label; let i = $index) {
          <!-- Background Ring -->
          <circle
            [attr.cx]="center"
            [attr.cy]="center"
            [attr.r]="getRingRadius(i)"
            class="ring-progress-bg"
            [attr.stroke-width]="strokeWidth"
          />
          <!-- Progress Ring -->
          <circle
            [attr.cx]="center"
            [attr.cy]="center"
            [attr.r]="getRingRadius(i)"
            class="ring-progress-fill"
            [class]="ring.color"
            [attr.stroke-width]="strokeWidth"
            [attr.stroke-dasharray]="getCircumference(i)"
            [attr.stroke-dashoffset]="getDashOffset(i, ring.value)"
            [attr.stroke]="'url(#' + ring.color + 'Gradient)'"
            style="transform: rotate(-90deg); transform-origin: center;"
          />
        }
      </svg>

      <!-- Center Content -->
      <div class="ring-center">
        <span class="ring-value">{{ totalPercentage() }}%</span>
        <span class="ring-label">Overall</span>
      </div>

      <!-- Legend -->
      @if (showLegend) {
        <div class="ring-legend">
          @for (ring of rings(); track ring.label) {
            <div class="legend-item">
              <span class="legend-dot" [class]="'bg-' + ring.color"></span>
              <span class="legend-label">{{ ring.label }}</span>
              <span class="legend-value">{{ ring.value }}%</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .ring-progress-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .ring-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .ring-value {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #A855F7, #3B82F6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .ring-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .ring-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      margin-top: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .legend-dot.bg-purple { background: linear-gradient(135deg, #A855F7, #EC4899); }
    .legend-dot.bg-blue { background: linear-gradient(135deg, #3B82F6, #06B6D4); }
    .legend-dot.bg-cyan { background: linear-gradient(135deg, #06B6D4, #10B981); }
    .legend-dot.bg-pink { background: linear-gradient(135deg, #EC4899, #F43F5E); }
    .legend-dot.bg-green { background: linear-gradient(135deg, #10B981, #059669); }

    .legend-label {
      color: rgba(255, 255, 255, 0.7);
    }

    .legend-value {
      color: white;
      font-weight: 600;
    }

    .ring-progress-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.08);
    }

    .ring-progress-fill {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ring-progress-fill.purple {
      filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.5));
    }

    .ring-progress-fill.blue {
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
    }

    .ring-progress-fill.cyan {
      filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.5));
    }

    .ring-progress-fill.pink {
      filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.5));
    }

    .ring-progress-fill.green {
      filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
    }
  `]
})
export class RingProgressComponent implements OnInit {
  @Input() segments: RingSegment[] = [];
  @Input() size: number = 200;
  @Input() strokeWidth: number = 12;
  @Input() showLegend: boolean = true;

  center = 0;

  ngOnInit() {
    this.center = this.size / 2;

    if (this.segments.length === 0) {
      this.segments = [
        { label: 'SEO Tools', value: 78, color: 'purple' },
        { label: 'Content', value: 65, color: 'blue' },
        { label: 'Analytics', value: 82, color: 'cyan' }
      ];
    }
  }

  rings = computed(() => this.segments);

  totalPercentage = computed(() => {
    if (this.segments.length === 0) return 0;
    const sum = this.segments.reduce((acc, s) => acc + s.value, 0);
    return Math.round(sum / this.segments.length);
  });

  getRingRadius(index: number): number {
    const baseRadius = (this.size / 2) - this.strokeWidth - 10;
    return baseRadius - (index * (this.strokeWidth + 8));
  }

  getCircumference(index: number): number {
    return 2 * Math.PI * this.getRingRadius(index);
  }

  getDashOffset(index: number, value: number): number {
    const circumference = this.getCircumference(index);
    return circumference - (value / 100) * circumference;
  }
}
