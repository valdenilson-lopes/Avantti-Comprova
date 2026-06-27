import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from './usuario.service';

export interface UsuarioLogado {
  id: number;
  nome: string;
  usuario: string;
  email?: string;
  ativo?: boolean;
  administrador?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CHAVE_USUARIO = 'usuario_logado';
  private readonly CHAVE_TOKEN = 'token';
  private readonly CHAVE_EXPIRA_EM = 'token_expira_em';

  // 8 horas de sessão local
  private readonly TEMPO_SESSAO_MS = 8 * 60 * 60 * 1000;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  async login(usuario: string, senha: string): Promise<UsuarioLogado | null> {
    const usuarioLogado = await this.usuarioService.autenticar(usuario, senha);

    if (!usuarioLogado) {
      this.limparSessao();
      return null;
    }

    const sessao: UsuarioLogado = {
      id: usuarioLogado.id,
      nome: usuarioLogado.nome,
      usuario: usuarioLogado.usuario,
      email: usuarioLogado.email,
      ativo: usuarioLogado.ativo,
      administrador: usuarioLogado.administrador
    };

    this.salvarSessao(this.gerarTokenLocal(usuarioLogado), sessao);
    return sessao;
  }

  salvarSessao(token: string, usuario: UsuarioLogado): void {
    const expiraEm = Date.now() + this.TEMPO_SESSAO_MS;

    localStorage.setItem(this.CHAVE_TOKEN, token);
    localStorage.setItem(this.CHAVE_USUARIO, JSON.stringify(usuario));
    localStorage.setItem(this.CHAVE_EXPIRA_EM, String(expiraEm));
  }

  obterUsuario(): UsuarioLogado | null {
    const dados = localStorage.getItem(this.CHAVE_USUARIO);

    if (!dados) {
      return null;
    }

    try {
      return JSON.parse(dados) as UsuarioLogado;
    } catch {
      this.limparSessao();
      return null;
    }
  }

  getUsuarioLogado(): UsuarioLogado | null {
    return this.obterUsuario();
  }

  obterToken(): string | null {
    if (this.sessaoExpirada()) {
      this.limparSessao();
      return null;
    }

    return localStorage.getItem(this.CHAVE_TOKEN);
  }

  estaLogado(): boolean {
    return !!this.obterToken() && !!this.obterUsuario();
  }

  ehAdministrador(): boolean {
    return this.obterUsuario()?.administrador === true;
  }

  limparSessao(): void {
    localStorage.removeItem(this.CHAVE_TOKEN);
    localStorage.removeItem(this.CHAVE_USUARIO);
    localStorage.removeItem(this.CHAVE_EXPIRA_EM);
  }

  logout(): void {
    this.limparSessao();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private sessaoExpirada(): boolean {
    const expiraEm = Number(localStorage.getItem(this.CHAVE_EXPIRA_EM));

    if (!expiraEm) {
      return false;
    }

    return Date.now() > expiraEm;
  }

  private gerarTokenLocal(usuario: Usuario): string {
    // Token local apenas para controle do front-end enquanto o login é feito via tabela usuarios no Supabase.
    // Quando migrar para Supabase Auth/JWT real, este método deve ser substituído pelo access_token retornado pelo Supabase.
    const base = `${usuario.id}:${usuario.usuario}:${Date.now()}`;
    return btoa(unescape(encodeURIComponent(base)));
  }
}
