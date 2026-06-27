import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  async autenticar(usuario: string, senha: string): Promise<Usuario | null> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, usuario, email, ativo, administrador')
        .ilike('usuario', usuario.trim())
        .eq('senha', senha)
        .eq('ativo', true)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as Usuario;
    } catch {
      return null;
    }
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, usuario, email, ativo, administrador')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Usuario;
  }

  async listar(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, usuario, email, ativo, administrador')
      .order('nome', { ascending: true });

    if (error) {
      throw error;
    }

    return data as Usuario[];
  }
}
