export interface Usuario {
  id?: number;
  nome: string;
  usuario: string;
  email: string;
  senha?: string;
  ativo: boolean;
  administrador: boolean;
  criado_em?: string | null;
  atualizado_em?: string | null;
}

export interface UsuarioFiltro {
  texto?: string;
  ativo?: boolean | null;
  administrador?: boolean | null;
}
