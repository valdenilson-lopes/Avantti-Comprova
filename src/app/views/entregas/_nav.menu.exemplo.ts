// Cole estes itens no seu _nav.ts do CoreUI, ajustando a posição no menu.

{
  name: 'Gestão de Entregas',
  url: '/dashboard-entregas',
  iconComponent: { name: 'cilTruck' },
  children: [
    { name: 'Dashboard', url: '/dashboard-entregas', icon: 'nav-icon-bullet' },
    { name: 'Monitor de Entregas', url: '/entregas', icon: 'nav-icon-bullet' },
    { name: 'Canhotos Pendentes', url: '/canhotos', icon: 'nav-icon-bullet' },
    { name: 'Logs de Processamento', url: '/logs-processamento', icon: 'nav-icon-bullet' }
  ]
}
