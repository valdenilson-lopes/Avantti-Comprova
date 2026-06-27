import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { Usuario, UsuarioFiltro } from '../models/usuario.model';

type UsuarioPayload = {
  nome: string;
  usuario: string;
  email: string;
  senha?: string;
  ativo: boolean;
  administrador: boolean;
};

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly tabela = 'usuarios';
  private readonly campos = 'id, nome, usuario, email, ativo, administrador, criado_em';

  async autenticar(usuario: string, senha: string): Promise<Usuario | null> {
    const login = usuario.trim();

    if (!login || !senha) return null;

    const { data, error } = await supabase
      .from(this.tabela)
      .select(this.campos)
      .ilike('usuario', login)
      .eq('senha', senha)
      .eq('ativo', true)
      .maybeSingle();

    if (error || !data) return null;
    return data as Usuario;
  }

  async listar(filtro: UsuarioFiltro = {}, limite = 500): Promise<Usuario[]> {
    let query = supabase
      .from(this.tabela)
      .select(this.campos)
      .order('nome', { ascending: true })
      .limit(limite);

    if (filtro.texto && filtro.texto.trim() !== '') {
      const texto = `%${filtro.texto.trim()}%`;
      query = query.or([
        `nome.ilike.${texto}`,
        `usuario.ilike.${texto}`,
        `email.ilike.${texto}`
      ].join(','));
    }

    if (filtro.ativo !== null && filtro.ativo !== undefined) {
      query = query.eq('ativo', filtro.ativo);
    }

    if (filtro.administrador !== null && filtro.administrador !== undefined) {
      query = query.eq('administrador', filtro.administrador);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []) as Usuario[];
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from(this.tabela)
      .select(this.campos)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Usuario | null;
  }

  async criar(usuario: Usuario): Promise<Usuario> {
    const payload = this.montarPayload(usuario, true);

    const { error } = await supabase
      .from(this.tabela)
      .insert(payload);

    if (error) throw error;

    const criado = await this.buscarPorUsuario(payload.usuario);
    if (!criado) throw new Error('Usuário gravado, mas não foi possível recarregar o registro.');

    return criado;
  }

  async atualizar(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const payload = this.montarPayload(usuario, false);

    const { error } = await supabase
      .from(this.tabela)
      .update(payload)
      .eq('id', id);

    if (error) throw error;

    const atualizado = await this.buscarPorId(id);
    if (!atualizado) throw new Error('Usuário atualizado, mas não foi possível recarregar o registro.');

    return atualizado;
  }

  async alterarSenha(id: number, novaSenha: string): Promise<void> {
    const senha = novaSenha.trim();
    if (!senha) throw new Error('Informe a nova senha.');

    const { error } = await supabase
      .from(this.tabela)
      .update({ senha })
      .eq('id', id);

    if (error) throw error;
  }

  async usuarioExiste(usuario: string, idIgnorar?: number): Promise<boolean> {
    const login = usuario.trim();
    if (!login) return false;

    let query = supabase
      .from(this.tabela)
      .select('id')
      .ilike('usuario', login)
      .limit(1);

    if (idIgnorar) {
      query = query.neq('id', idIgnorar);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).length > 0;
  }

  private async buscarPorUsuario(usuario: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from(this.tabela)
      .select(this.campos)
      .ilike('usuario', usuario.trim())
      .maybeSingle();

    if (error) throw error;
    return data as Usuario | null;
  }

  private montarPayload(usuario: Partial<Usuario>, incluirSenha: boolean): UsuarioPayload {
    const payload: UsuarioPayload = {
      nome: (usuario.nome || '').trim(),
      usuario: (usuario.usuario || '').trim(),
      email: (usuario.email || '').trim(),
      ativo: usuario.ativo === true,
      administrador: usuario.administrador === true
    };

    if (incluirSenha || (usuario.senha && usuario.senha.trim() !== '')) {
      payload.senha = (usuario.senha || '').trim();
    }

    return payload;
  }
}
