import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RadarDataPoint {
  label: string;
  value: number;
  maxValue?: number;
}

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="radar-chart">
      <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: rgba(168, 85, 247, 0.4)" />
            <stop offset="100%" style="stop-color: rgba(59, 130, 246, 0.2)" />
          </linearGradient>
        </defs>

        <!-- Background Grid -->
        @for (level of gridLevels; track level) {
          <polygon
            [attr.points]="getGridPoints(level)"
            class="radar-grid"
          />
        }

        <!-- Axis Lines -->
        @for (point of axisPoints(); track point.angle) {
          <line
            [attr.x1]="center"
            [attr.y1]="center"
            [attr.x2]="point.x"
            [attr.y2]="point.y"
            class="radar-axis"
          />
        }

        <!-- Data Area -->
        <polygon
          [attr.points]="dataPolygonPoints()"
          class="radar-area"
        />

        <!-- Data Points -->
        @for (point of dataPoints(); track point.label) {
          <circle
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            r="5"
            class="radar-point"
          />
        }

        <!-- Labels -->
        @for (point of labelPoints(); track point.label) {
          <text
            [attr.x]="point.x"
            [attr.y]="point.y"
            class="radar-label"
            [attr.text-anchor]="point.anchor"
            [attr.dominant-baseline]="point.baseline"
          >
            {{ point.label }}
          </text>
        }
      </svg>
    </div>
  `,
  styles: [`
    .radar-chart {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class RadarChartComponent implements OnInit {
  @Input() data: RadarDataPoint[] = [];
  @Input() size: number = 280;

  gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  center = 0;
  radius = 0;

  ngOnInit() {
    this.center = this.size / 2;
    this.radius = (this.size / 2) - 40;

    if (this.data.length === 0) {
      this.data = [
        { label: 'SEO', value: 85 },
        { label: 'Content', value: 70 },
        { label: 'Social', value: 90 },
        { label: 'Analytics', value: 65 },
        { label: 'Email', value: 75 },
        { label: 'Ads', value: 80 }
      ];
    }
  }

  axisPoints = computed(() => {
    const numAxes = this.data.length;
    return this.data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      return {
        angle,
        x: this.center + this.radius * Math.cos(angle),
        y: this.center + this.radius * Math.sin(angle)
      };
    });
  });

  dataPoints = computed(() => {
    const numAxes = this.data.length;
    return this.data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const maxVal = d.maxValue || 100;
      const normalizedValue = d.value / maxVal;
      return {
        label: d.label,
        x: this.center + this.radius * normalizedValue * Math.cos(angle),
        y: this.center + this.radius * normalizedValue * Math.sin(angle)
      };
    });
  });

  dataPolygonPoints = computed(() => {
    return this.dataPoints()
      .map(p => `${p.x},${p.y}`)
      .join(' ');
  });

  labelPoints = computed(() => {
    const numAxes = this.data.length;
    const labelRadius = this.radius + 25;
    return this.data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = this.center + labelRadius * Math.cos(angle);
      const y = this.center + labelRadius * Math.sin(angle);

      let anchor = 'middle';
      if (Math.cos(angle) > 0.3) anchor = 'start';
      if (Math.cos(angle) < -0.3) anchor = 'end';

      let baseline = 'middle';
      if (Math.sin(angle) > 0.3) baseline = 'hanging';
      if (Math.sin(angle) < -0.3) baseline = 'auto';

      return { label: d.label, x, y, anchor, baseline };
    });
  });

  getGridPoints(level: number): string {
    const numAxes = this.data.length;
    const points: string[] = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = this.center + this.radius * level * Math.cos(angle);
      const y = this.center + this.radius * level * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }
}
