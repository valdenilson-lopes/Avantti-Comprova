import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { Usuario, UsuarioFiltro } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly tabela = 'usuarios';

  async autenticar(usuario: string, senha: string): Promise<Usuario | null> {
    const login = usuario.trim();

    if (!login || !senha) return null;

    const { data, error } = await supabase
      .from(this.tabela)
      .select('id, nome, usuario, email, ativo, administrador')
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
      .select('id, nome, usuario, email, ativo, administrador')
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

    if (filtro.ativo !== null && filtro.ativo !== undefined) query = query.eq('ativo', filtro.ativo);
    if (filtro.administrador !== null && filtro.administrador !== undefined) query = query.eq('administrador', filtro.administrador);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Usuario[];
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from(this.tabela)
      .select('id, nome, usuario, email, ativo, administrador')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Usuario | null;
  }

  async criar(usuario: Usuario): Promise<Usuario> {
    const payload = this.montarPayload(usuario, true);

    const { data, error } = await supabase
      .from(this.tabela)
      .insert(payload)
      .select('id, nome, usuario, email, ativo, administrador')
      .single();

    if (error) throw error;
    return data as Usuario;
  }

  async atualizar(id: number, usuario: Usuario): Promise<Usuario> {
    const payload = this.montarPayload(usuario, false);

    const { data, error } = await supabase
      .from(this.tabela)
      .update(payload)
      .eq('id', id)
      .select('id, nome, usuario, email, ativo, administrador')
      .single();

    if (error) throw error;
    return data as Usuario;
  }

  async excluir(id: number): Promise<void> {
    const { error } = await supabase.from(this.tabela).delete().eq('id', id);
    if (error) throw error;
  }

  async alterarSenha(id: number, novaSenha: string): Promise<void> {
    const senha = novaSenha.trim();
    if (!senha) throw new Error('Informe a nova senha.');

    const { error } = await supabase
      .from(this.tabela)
      .update({ senha, atualizado_em: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async usuarioExiste(usuario: string, idIgnorar?: number): Promise<boolean> {
    let query = supabase.from(this.tabela).select('id').ilike('usuario', usuario.trim()).limit(1);
    if (idIgnorar) query = query.neq('id', idIgnorar);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length > 0;
  }

  private montarPayload(usuario: Usuario, incluirSenha: boolean): Partial<Usuario> {
    const payload: Partial<Usuario> = {
      nome: usuario.nome.trim(),
      usuario: usuario.usuario.trim(),
      email: usuario.email.trim(),
      ativo: usuario.ativo === true,
      administrador: usuario.administrador === true,
      atualizado_em: new Date().toISOString()
    };

    if (incluirSenha || (usuario.senha && usuario.senha.trim() !== '')) {
      payload.senha = usuario.senha?.trim();
    }

    return payload;
  }
}
