import { Usuario } from './usuario.model';

export interface SessaoUsuario {
  usuario: Usuario;
  token: string;
  criadoEm: string;
  expiraEm: string;
}

export interface LoginResult {
  usuario: Usuario;
  token: string;
  expiraEm: string;
}
