import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { SessaoUsuario } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly chaveSessao = 'avantti_sessao';
  private readonly tempoSessaoHoras = 8;

  salvarSessao(usuario: Usuario, token?: string): SessaoUsuario {
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + this.tempoSessaoHoras * 60 * 60 * 1000);

    const sessao: SessaoUsuario = {
      usuario,
      token: token || this.gerarTokenLocal(),
      criadoEm: agora.toISOString(),
      expiraEm: expiraEm.toISOString()
    };

    localStorage.setItem(this.chaveSessao, JSON.stringify(sessao));
    return sessao;
  }

  getSessao(): SessaoUsuario | null {
    const sessaoStorage = localStorage.getItem(this.chaveSessao);

    if (!sessaoStorage) {
      return null;
    }

    try {
      const sessao = JSON.parse(sessaoStorage) as SessaoUsuario;

      if (!sessao.usuario || !sessao.token || !sessao.expiraEm) {
        this.limpar();
        return null;
      }

      if (this.sessaoExpirada(sessao)) {
        this.limpar();
        return null;
      }

      return sessao;
    } catch {
      this.limpar();
      return null;
    }
  }

  getUsuario(): Usuario | null {
    return this.getSessao()?.usuario || null;
  }

  getToken(): string | null {
    return this.getSessao()?.token || null;
  }

  estaLogado(): boolean {
    return this.getSessao() !== null;
  }

  limpar(): void {
    localStorage.removeItem(this.chaveSessao);
  }

  private sessaoExpirada(sessao: SessaoUsuario): boolean {
    return new Date(sessao.expiraEm).getTime() <= new Date().getTime();
  }

  private gerarTokenLocal(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}
