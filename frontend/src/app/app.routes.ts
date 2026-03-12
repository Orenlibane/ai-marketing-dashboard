import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'tools',
    loadComponent: () => import('./pages/tools/tools.component').then(m => m.ToolsComponent)
  },
  {
    path: 'tools/:id',
    loadComponent: () => import('./pages/tool-detail/tool-detail.component').then(m => m.ToolDetailComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'integrations',
    loadComponent: () => import('./pages/integrations/integrations.component').then(m => m.IntegrationsComponent)
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news.component').then(m => m.NewsPageComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
