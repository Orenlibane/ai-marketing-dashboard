import { Component, Input, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DataPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-area-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="area-chart-container">
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: rgba(168, 85, 247, 0.4)" />
            <stop offset="50%" style="stop-color: rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" style="stop-color: rgba(59, 130, 246, 0)" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: #A855F7" />
            <stop offset="100%" style="stop-color: #3B82F6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Grid Lines -->
        @for (line of gridLines; track line) {
          <line
            [attr.x1]="padding"
            [attr.y1]="line"
            [attr.x2]="width - padding"
            [attr.y2]="line"
            stroke="rgba(255, 255, 255, 0.05)"
            stroke-dasharray="4,4"
          />
        }

        <!-- Area Fill -->
        <path
          [attr.d]="areaPath()"
          fill="url(#areaGradientFill)"
        />

        <!-- Line -->
        <path
          [attr.d]="linePath()"
          fill="none"
          stroke="url(#lineGradient)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#glow)"
        />

        <!-- Data Points -->
        @for (point of chartPoints(); track point.x) {
          <circle
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            r="5"
            fill="#0F172A"
            stroke="url(#lineGradient)"
            stroke-width="2"
            class="data-point"
          />
        }

        <!-- X-Axis Labels -->
        @for (point of chartPoints(); track point.x; let i = $index) {
          <text
            [attr.x]="point.x"
            [attr.y]="height - 8"
            class="axis-label"
            text-anchor="middle"
          >
            {{ data[i]?.label }}
          </text>
        }
      </svg>
    </div>
  `,
  styles: [`
    .area-chart-container {
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }

    .area-chart-container svg {
      width: 100%;
      height: auto;
      overflow: visible;
      display: block;
    }

    .data-point {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .data-point:hover {
      r: 7;
      filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6));
    }

    .axis-label {
      fill: rgba(255, 255, 255, 0.5);
      font-size: 11px;
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .axis-label {
        font-size: 9px;
      }
    }
  `]
})
export class AreaChartComponent implements OnInit {
  @Input() data: DataPoint[] = [];
  @Input() width: number = 400;
  @Input() height: number = 200;

  padding = 30;
  gridLines: number[] = [];

  ngOnInit() {
    if (this.data.length === 0) {
      this.data = [
        { label: 'Mon', value: 45 },
        { label: 'Tue', value: 62 },
        { label: 'Wed', value: 58 },
        { label: 'Thu', value: 78 },
        { label: 'Fri', value: 72 },
        { label: 'Sat', value: 85 },
        { label: 'Sun', value: 68 }
      ];
    }

    const chartHeight = this.height - this.padding * 2;
    this.gridLines = [
      this.padding,
      this.padding + chartHeight * 0.25,
      this.padding + chartHeight * 0.5,
      this.padding + chartHeight * 0.75
    ];
  }

  chartPoints = computed(() => {
    const maxValue = Math.max(...this.data.map(d => d.value));
    const chartWidth = this.width - this.padding * 2;
    const chartHeight = this.height - this.padding * 2;
    const stepX = chartWidth / (this.data.length - 1);

    return this.data.map((d, i) => ({
      x: this.padding + i * stepX,
      y: this.padding + chartHeight - (d.value / maxValue) * chartHeight
    }));
  });

  linePath = computed(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + 2 * (curr.x - prev.x) / 3;
      path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return path;
  });

  areaPath = computed(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    const bottomY = this.height - this.padding;
    let path = `M ${points[0].x} ${bottomY}`;
    path += ` L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + 2 * (curr.x - prev.x) / 3;
      path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    path += ` L ${points[points.length - 1].x} ${bottomY}`;
    path += ' Z';

    return path;
  });
}
