import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { Motorista } from '../models/motorista.model';

@Injectable({
  providedIn: 'root'
})
export class MotoristaService {

  async listar(): Promise<Motorista[]> {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data as Motorista[];
  }

  async totalMotoristas(): Promise<number> {
    const { count, error } = await supabase
      .from('motoristas')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }
}
