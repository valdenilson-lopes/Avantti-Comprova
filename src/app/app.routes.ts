import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    canActivate: [authGuard],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then(m => m.routes)
      },
      {
        path: 'entregas',
        loadChildren: () =>
          import('./views/entregas/gestao-entregas.routes').then(m => m.gestaoEntregasRoutes)
      },
      {
        path: 'motoristas',
        loadComponent: () => import('./views/motoristas/motoristas.component').then(m => m.MotoristasComponent)
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then(m => m.routes)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./views/buttons/routes').then(m => m.routes)
      },
      {
        path: 'forms',
        loadChildren: () => import('./views/forms/routes').then(m => m.routes)
      },
      {
        path: 'icons',
        loadChildren: () => import('./views/icons/routes').then(m => m.routes)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./views/notifications/routes').then(m => m.routes)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./views/widgets/routes').then(m => m.routes)
      },
      {
        path: 'charts',
        loadChildren: () => import('./views/charts/routes').then(m => m.routes)
      },
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then(m => m.routes)
      }
    ]
  },

  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login'
    }
  },

  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component)
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component)
  },

  {
    path: '**',
    redirectTo: '404'
  }
];
