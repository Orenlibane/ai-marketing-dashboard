import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface DockItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-floating-dock',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="floating-dock">
      @for (item of dockItems; track item.route) {
        <button
          class="dock-item"
          [class.active]="isActive(item.route)"
          (click)="navigate(item.route)"
          [attr.title]="item.label"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            @switch (item.icon) {
              @case ('home') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              }
              @case ('grid') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              }
              @case ('heart') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              }
              @case ('chart') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              }
              @case ('newspaper') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              }
              @case ('cog') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              }
            }
          </svg>
        </button>
      }
    </nav>
  `,
  styles: [`
    .floating-dock {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      box-shadow:
        0 20px 40px -10px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.05) inset;
      z-index: 100;
      max-width: calc(100vw - 32px);
    }

    .dock-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: transparent;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: none;
      outline: none;
      flex-shrink: 0;
    }

    .dock-item:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-4px) scale(1.1);
    }

    .dock-item.active {
      color: white;
      background: linear-gradient(135deg, #A855F7 0%, #3B82F6 100%);
      box-shadow: 0 6px 20px -4px rgba(168, 85, 247, 0.6);
      transform: translateY(-2px);
    }

    .dock-item.active:hover {
      transform: translateY(-4px) scale(1.05);
    }

    .dock-item svg {
      width: 20px;
      height: 20px;
      stroke-width: 1.5;
    }

    /* Tablet */
    @media (max-width: 768px) {
      .floating-dock {
        bottom: 16px;
        gap: 4px;
        padding: 8px 12px;
        border-radius: 20px;
      }

      .dock-item {
        width: 42px;
        height: 42px;
        border-radius: 10px;
      }

      .dock-item svg {
        width: 18px;
        height: 18px;
      }
    }

    /* Mobile */
    @media (max-width: 480px) {
      .floating-dock {
        bottom: 12px;
        gap: 2px;
        padding: 6px 10px;
        border-radius: 18px;
      }

      .dock-item {
        width: 38px;
        height: 38px;
        border-radius: 10px;
      }

      .dock-item svg {
        width: 16px;
        height: 16px;
      }

      .dock-item:hover {
        transform: none;
      }

      .dock-item.active {
        transform: none;
        box-shadow: 0 4px 12px -2px rgba(168, 85, 247, 0.5);
      }
    }
  `]
})
export class FloatingDockComponent {
  private router = inject(Router);

  dockItems: DockItem[] = [
    { icon: 'home', label: 'Dashboard', route: '/' },
    { icon: 'grid', label: 'All Tools', route: '/tools' },
    { icon: 'heart', label: 'Favorites', route: '/favorites' },
    { icon: 'chart', label: 'Analytics', route: '/analytics' },
    { icon: 'newspaper', label: 'News', route: '/news' }
  ];

  isActive(route: string): boolean {
    if (route === '/') {
      return this.router.url === '/' || this.router.url === '';
    }
    return this.router.url.startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
