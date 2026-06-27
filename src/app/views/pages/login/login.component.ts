import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective
  ]
})
export class LoginComponent {
  usuario = '';
  senha = '';
  erro = '';
  carregando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async entrar(): Promise<void> {
    if (this.carregando) {
      return;
    }

    this.erro = '';

    const usuario = this.usuario.trim();
    const senha = this.senha;

    if (!usuario) {
      this.erro = 'Informe o usuário.';
      return;
    }

    if (!senha) {
      this.erro = 'Informe a senha.';
      return;
    }

    this.carregando = true;

    try {
      const usuarioLogado = await this.loginComTimeout(usuario, senha);

      if (!usuarioLogado) {
        this.erro = 'Usuário ou senha inválidos.';
        return;
      }

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.erro = 'Não foi possível realizar o login. Verifique sua conexão e tente novamente.';
    } finally {
      this.carregando = false;
    }
  }

  private loginComTimeout(usuario: string, senha: string): Promise<unknown> {
    const timeoutMs = 15000;

    return Promise.race([
      this.authService.login(usuario, senha),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tempo limite excedido')), timeoutMs)
      )
    ]);
  }
}
