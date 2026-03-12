import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          @if (!collapsed()) {
            <div class="logo-text">
              <span class="text-lg font-bold text-white">AI Marketing</span>
              <span class="text-xs text-white/50">Dashboard</span>
            </div>
          }
        </div>
        <button (click)="toggleCollapse()" class="collapse-btn">
          <svg class="w-5 h-5 transition-transform" [class.rotate-180]="collapsed()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.route === '/' }"
             class="nav-item"
             [title]="collapsed() ? item.label : ''">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            @if (!collapsed()) {
              <span class="nav-label">{{ item.label }}</span>
              @if (item.badge) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            }
          </a>
        }
      </nav>

      <!-- Divider -->
      <div class="sidebar-divider"></div>

      <!-- Categories Section -->
      @if (!collapsed()) {
        <div class="sidebar-section">
          <h3 class="section-title">Categories</h3>
          @for (cat of categories; track cat.name) {
            <button (click)="selectCategory.emit(cat.name)"
                    class="category-item"
                    [class.active]="selectedCategories.has(cat.name)">
              <span>{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
            </button>
          }
        </div>
      }

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="user-section">
          <div class="user-avatar">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          @if (!collapsed()) {
            <div class="user-info">
              <span class="text-sm font-medium text-white">Guest User</span>
              <span class="text-xs text-white/50">Free Plan</span>
            </div>
            <button class="settings-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: linear-gradient(180deg, #1A253D 0%, #0F172A 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 50;
      transition: width 0.3s ease;
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sidebar-header {
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FF5722 0%, #FF7043 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .collapse-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.2s ease;
    }

    .collapse-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .collapsed .collapse-btn {
      display: none;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(255, 87, 34, 0.2) 0%, rgba(255, 112, 67, 0.2) 100%);
      color: #FF5722;
      border: 1px solid rgba(255, 87, 34, 0.3);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .nav-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .nav-label {
      font-size: 14px;
      font-weight: 500;
    }

    .nav-badge {
      margin-left: auto;
      background: #FF5722;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .sidebar-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 8px 20px;
    }

    .sidebar-section {
      padding: 8px 12px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.4);
      padding: 8px 16px;
      margin-bottom: 4px;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 16px;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
      transition: all 0.2s ease;
    }

    .category-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .category-item.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .settings-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.2s ease;
    }

    .settings-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .collapsed .sidebar-section,
    .collapsed .logo-text,
    .collapsed .nav-label,
    .collapsed .nav-badge,
    .collapsed .user-info,
    .collapsed .settings-btn {
      display: none;
    }

    .collapsed .sidebar-header {
      justify-content: center;
      padding: 20px 16px;
    }

    .collapsed .nav-item {
      justify-content: center;
      padding: 12px;
    }

    .collapsed .user-section {
      justify-content: center;
    }
  `]
})
export class SidebarComponent {
  @Input() selectedCategories: Set<string> = new Set();
  @Output() selectCategory = new EventEmitter<string>();

  collapsed = signal(false);

  navItems: NavItem[] = [
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
      label: 'Dashboard',
      route: '/'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`,
      label: 'All Tools',
      route: '/tools'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>`,
      label: 'Favorites',
      route: '/favorites'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>`,
      label: 'Integrations',
      route: '/integrations'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`,
      label: 'News',
      route: '/news'
    },
    {
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`,
      label: 'Analytics',
      route: '/analytics'
    }
  ];

  categories = [
    { name: 'SEO', icon: '🔍' },
    { name: 'Content', icon: '✍️' },
    { name: 'Social', icon: '📱' },
    { name: 'Analytics', icon: '📊' },
    { name: 'Email', icon: '📧' },
    { name: 'Ads', icon: '📢' },
    { name: 'Video', icon: '🎬' },
    { name: 'Design', icon: '🎨' }
  ];

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }
}
