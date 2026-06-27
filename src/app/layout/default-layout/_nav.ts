import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: {
      name: 'cil-speedometer'
    }
  },
  {
    title: true,
    name: 'Operação'
  },
  {
    name: 'Gestão de Entregas',
    url: '/entregas',
    iconComponent: {
      name: 'cilTruck'
    },
    children: [
      {
        name: 'Dashboard',
        url: '/entregas/dashboard',
        iconComponent: {
          name: 'cil-speedometer'
        }
      },
      {
        name: 'Monitor de Entregas',
        url: '/entregas/monitor',
        iconComponent: {
          name: 'cilList'
        }
      },
      {
        name: 'Canhotos',
        url: '/entregas/canhotos',
        iconComponent: {
          name: 'cilDescription'
        }
      },
      {
        name: 'Logs de Processamento',
        url: '/entregas/logs-processamento',
        iconComponent: {
          name: 'cilNotes'
        }
      }
    ]
  },
  {
    title: true,
    name: 'Cadastros'
  },
  {
    name: 'Motoristas',
    url: '/motoristas',
    iconComponent: {
      name: 'cilUser'
    }
  },
  {
    title: true,
    name: 'Administração'
  },
  {
    name: 'Usuários',
    url: '/administracao/usuarios',
    iconComponent: {
      name: 'cilUser'
    }
  }
];
