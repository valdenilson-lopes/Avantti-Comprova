import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { NfeProcessLog, NotificacaoLog } from '../models/entrega.model';

@Injectable({ providedIn: 'root' })
export class ProcessamentoService {
  async listarLogsNfe(limite = 100): Promise<NfeProcessLog[]> {
    const { data, error } = await supabase
      .from('nfe_process_log')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return (data || []) as NfeProcessLog[];
  }

  async listarNotificacoes(limite = 100): Promise<NotificacaoLog[]> {
    const { data, error } = await supabase
      .from('notificacoes_log')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return (data || []) as NotificacaoLog[];
  }
}
