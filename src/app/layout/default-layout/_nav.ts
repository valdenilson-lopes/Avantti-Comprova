import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Gestão de Entregas',
    url: '/entregas/dashboard',
    iconComponent: { name: 'cilTruck' },
    children: [
      {
        name: 'Dashboard',
        url: '/entregas/dashboard',
        iconComponent: { name: 'cil-speedometer' }
      },
      {
        name: 'Monitor de Entregas',
        url: '/entregas/monitor',
        iconComponent: { name: 'cilList' }
      },
      {
        name: 'Canhotos',
        url: '/entregas/canhotos',
        iconComponent: { name: 'cilDescription' }
      },
      {
        name: 'Logs de Processamento',
        url: '/entregas/logs-processamento',
        iconComponent: { name: 'cilNotes' }
      }
    ]
  },
  {
    name: 'Cadastros',
    url: '/cadastros',
    iconComponent: { name: 'cilAddressBook' },
    children: [
      {
        name: 'Motoristas',
        url: '/motoristas',
        iconComponent: { name: 'cilUser' }
      }
    ]
  }
];
