import { Routes } from '@angular/router';

export const gestaoEntregasRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard-entregas/dashboard-entregas.component')
        .then(m => m.DashboardEntregasComponent)
  },
  {
    path: 'monitor',
    loadComponent: () =>
      import('./monitor-entregas/monitor-entregas.component')
        .then(m => m.MonitorEntregasComponent)
  },
  {
    path: 'detalhe/:id',
    loadComponent: () =>
      import('./detalhe-entrega/detalhe-entrega.component')
        .then(m => m.DetalheEntregaComponent)
  },
  {
    path: 'canhotos',
    loadComponent: () =>
      import('./canhotos/canhotos.component')
        .then(m => m.CanhotosComponent)
  },
  {
    path: 'logs-processamento',
    loadComponent: () =>
      import('./logs-processamento/logs-processamento.component')
        .then(m => m.LogsProcessamentoComponent)
  }
];
