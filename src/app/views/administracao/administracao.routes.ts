import { Routes } from '@angular/router';

export const administracaoRoutes: Routes = [
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./usuarios/usuarios.component').then(m => m.UsuariosComponent)
  }
];
