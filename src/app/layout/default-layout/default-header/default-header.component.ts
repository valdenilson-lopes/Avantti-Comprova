import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';
import { AuthService, UsuarioLogado } from '../../../core/services/auth.service';

@Component({
  selector: 'app-default-header',
  standalone: true,
  templateUrl: './default-header.component.html',
  imports: [
    CommonModule,
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    IconDirective,
    BreadcrumbRouterComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    DropdownHeaderDirective,
    DropdownDividerDirective,
    AvatarComponent,
    BadgeComponent
  ]
})
export class DefaultHeaderComponent extends HeaderComponent {
  @Input() sidebarId = 'sidebar1';

  usuario: UsuarioLogado | null = null;

  constructor(
    private authService: AuthService,
    public colorModeService: ColorModeService
  ) {
    super();
    this.usuario = this.authService.obterUsuario();
  }

  get nomeUsuario(): string {
    return this.usuario?.nome || this.usuario?.usuario || 'Usuário';
  }

  get perfilUsuario(): string {
    return this.usuario?.administrador ? 'Administrador' : 'Usuário';
  }

  get iniciaisUsuario(): string {
    const nome = this.nomeUsuario.trim();

    if (!nome) {
      return 'U';
    }

    const partes = nome.split(' ').filter(Boolean);

    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
  }

  sair(): void {
    this.authService.logout();
  }
}
