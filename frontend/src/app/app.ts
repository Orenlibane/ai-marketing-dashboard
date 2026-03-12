import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FloatingDockComponent } from './components/floating-dock/floating-dock.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FloatingDockComponent],
  template: `
    <!-- Animated Background -->
    <div class="animated-bg"></div>

    <!-- Particle Effects -->
    <div class="particles">
      @for (i of particles; track i) {
        <div class="particle"
             [style.left.%]="getParticleLeft(i)"
             [style.animation-delay.s]="i * 2"
             [style.animation-duration.s]="15 + (i * 2)">
        </div>
      }
    </div>

    <!-- Main Content -->
    <div class="relative min-h-screen pb-24">
      <router-outlet />
    </div>

    <!-- Floating Dock Navigation -->
    <app-floating-dock />
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class App {
  particles = Array.from({ length: 15 }, (_, i) => i);

  getParticleLeft(index: number): number {
    return (index * 7) % 100;
  }
}
