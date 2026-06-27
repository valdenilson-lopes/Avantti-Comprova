import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import {
  DashboardEntregasResumo,
  Entrega,
  EntregaFiltro,
  EntregaPorCidade,
  EntregaPorStatus
} from '../models/entrega.model';

@Injectable({ providedIn: 'root' })
export class EntregaService {
  private readonly tabela = 'entregas';

  async obterResumo(filtro: EntregaFiltro = {}): Promise<DashboardEntregasResumo> {
    const entregas = await this.listar(filtro, 10000);

    return {
      total: entregas.length,
      abertas: entregas.filter((e) => this.statusAberto(e.status)).length,
      entregues: entregas.filter((e) => this.statusEntregue(e.status)).length,
      ocorrencias: entregas.filter((e) => this.statusOcorrencia(e.status) || this.statusNaoEntregue(e.status)).length,
      parciais: entregas.filter((e) => this.statusParcial(e.status)).length,
      devolucoes: entregas.filter((e) => this.statusDevolucao(e.status)).length,
      semCanhoto: entregas.filter((e) => this.semCanhoto(e)).length,
      comFotos: entregas.filter((e) => this.temFotos(e)).length,
      valorTotal: entregas.reduce((acc, e) => acc + this.valorNumerico(e.valor_total), 0)
    };
  }

  async listar(filtro: EntregaFiltro = {}, limite = 500): Promise<Entrega[]> {
    let query = supabase
      .from(this.tabela)
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(limite);

    query = this.aplicarFiltros(query, filtro);

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar entregas:', error);
      throw error;
    }

    return (data || []) as Entrega[];
  }

  async listarEntregas(filtro: EntregaFiltro = {}, limite = 500): Promise<Entrega[]> {
    return this.listar(filtro, limite);
  }

  async listarPendentes(filtro: EntregaFiltro = {}, limite = 500): Promise<Entrega[]> {
    const entregas = await this.listar(filtro, limite);

    return entregas.filter((e) => {
      const status = this.normalizarStatus(e.status);
      return !this.statusEntregue(status) && !this.statusCancelado(status);
    });
  }

  async listarCanhotosPendentes(filtro: EntregaFiltro = {}, limite = 500): Promise<Entrega[]> {
    const entregas = await this.listar(filtro, limite);
    return entregas.filter((e) => this.semCanhoto(e));
  }

  async buscarPorId(id: string): Promise<Entrega | null> {
    const { data, error } = await supabase
      .from(this.tabela)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar entrega por ID:', error);
      throw error;
    }

    return data as Entrega | null;
  }

  async atualizarStatus(id: string, status: string, observacao?: string): Promise<void> {
    const payload: Partial<Entrega> = {
      status,
      atualizado_em: new Date().toISOString()
    };

    if (observacao !== undefined) {
      payload.observacao = observacao;
    }

    const { error } = await supabase
      .from(this.tabela)
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status da entrega:', error);
      throw error;
    }
  }

  async obterPorStatus(filtro: EntregaFiltro = {}): Promise<EntregaPorStatus[]> {
    const entregas = await this.listar(filtro, 10000);
    const mapa = new Map<string, number>();

    entregas.forEach((entrega) => {
      const status = this.descricaoStatus(entrega.status);
      mapa.set(status, (mapa.get(status) || 0) + 1);
    });

    return Array.from(mapa.entries())
      .map(([status, quantidade]) => ({ status, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  async obterPorCidade(filtro: EntregaFiltro = {}): Promise<EntregaPorCidade[]> {
    const entregas = await this.listar(filtro, 10000);
    const mapa = new Map<string, EntregaPorCidade>();

    entregas.forEach((entrega) => {
      const cidade = entrega.cidade || 'Não informado';
      const chave = `${cidade}|${entrega.uf || ''}`;
      const atual = mapa.get(chave) || { cidade, uf: entrega.uf, quantidade: 0 };
      atual.quantidade += 1;
      mapa.set(chave, atual);
    });

    return Array.from(mapa.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }

  descricaoStatus(status?: string | null): string {
    const s = this.normalizarStatus(status);

    if (this.statusAberto(s)) return 'Aberta';
    if (this.statusEntregue(s)) return 'Entregue';
    if (this.statusParcial(s)) return 'Parcial';
    if (this.statusDevolucao(s)) return 'Devolução';
    if (this.statusNaoEntregue(s)) return 'Não entregue';
    if (this.statusOcorrencia(s)) return 'Ocorrência';
    if (this.statusCancelado(s)) return 'Cancelada';

    return status || 'Não informado';
  }

  classeStatus(status?: string | null): string {
    const s = this.normalizarStatus(status);

    if (this.statusAberto(s)) return 'warning';
    if (this.statusEntregue(s)) return 'success';
    if (this.statusParcial(s)) return 'info';
    if (this.statusDevolucao(s)) return 'danger';
    if (this.statusNaoEntregue(s)) return 'danger';
    if (this.statusOcorrencia(s)) return 'danger';
    if (this.statusCancelado(s)) return 'secondary';

    return 'secondary';
  }

  private aplicarFiltros(query: any, filtro: EntregaFiltro): any {
    if (filtro.texto && filtro.texto.trim() !== '') {
      const texto = `%${filtro.texto.trim()}%`;
      query = query.or([
        `cliente.ilike.${texto}`,
        `numero_nf.ilike.${texto}`,
        `numero_documento.ilike.${texto}`,
        `chave_nfe.ilike.${texto}`,
        `cidade.ilike.${texto}`,
        `motorista_responsavel.ilike.${texto}`
      ].join(','));
    }

    if (filtro.status && filtro.status.trim() !== '') {
      query = query.eq('status', filtro.status);
    }

    if (filtro.cidade && filtro.cidade.trim() !== '') {
      query = query.ilike('cidade', `%${filtro.cidade.trim()}%`);
    }

    if (filtro.uf && filtro.uf.trim() !== '') {
      query = query.eq('uf', filtro.uf);
    }

    if (filtro.motorista && filtro.motorista.trim() !== '') {
      query = query.ilike('motorista_responsavel', `%${filtro.motorista.trim()}%`);
    }

    // Importante: só filtra empresa/filial se vier preenchido.
    // Assim o dashboard lista os dados do banco mesmo quando a sessão ainda não possui CNPJ/filial.
    if (filtro.cnpjEmpresa && filtro.cnpjEmpresa.trim() !== '') {
      query = query.eq('cnpj_empresa', filtro.cnpjEmpresa);
    }

    if (filtro.codfilial && filtro.codfilial.trim() !== '') {
      query = query.eq('codfilial', filtro.codfilial);
    }

    if (filtro.dataInicial && filtro.dataInicial.trim() !== '') {
      query = query.gte('criado_em', filtro.dataInicial);
    }

    if (filtro.dataFinal && filtro.dataFinal.trim() !== '') {
      query = query.lte('criado_em', filtro.dataFinal);
    }

    if (filtro.somenteSemCanhoto) {
      query = query.is('assinatura_url', null);
    }

    return query;
  }

  private normalizarStatus(status?: string | null): string {
    return (status || '').trim().toLowerCase();
  }

  private statusAberto(status?: string | null): boolean {
    return ['open', 'aberta', 'aberto', 'pendente', 'pending'].includes(this.normalizarStatus(status));
  }

  private statusEntregue(status?: string | null): boolean {
    return ['delivered', 'entregue', 'entregues', 'finalizada', 'finalizado', 'concluida', 'concluída'].includes(this.normalizarStatus(status));
  }

  private statusNaoEntregue(status?: string | null): boolean {
    return ['notdelivered', 'not_delivered', 'not delivered', 'naoentregue', 'nao_entregue', 'nao entregue', 'nãoentregue', 'não_entregue', 'não entregue'].includes(this.normalizarStatus(status));
  }

  private statusOcorrencia(status?: string | null): boolean {
    return ['problem', 'occurrence', 'ocorrencia', 'ocorrência', 'problema'].includes(this.normalizarStatus(status));
  }

  private statusParcial(status?: string | null): boolean {
    return ['partial', 'parcial', 'entrega_parcial'].includes(this.normalizarStatus(status));
  }

  private statusDevolucao(status?: string | null): boolean {
    return ['returned', 'devolucao', 'devolução', 'devolvida'].includes(this.normalizarStatus(status));
  }

  private statusCancelado(status?: string | null): boolean {
    return ['cancelled', 'canceled', 'cancelada', 'cancelado'].includes(this.normalizarStatus(status));
  }

  private temFotos(entrega: Entrega): boolean {
    return Array.isArray(entrega.fotos) && entrega.fotos.length > 0;
  }

  private semCanhoto(entrega: Entrega): boolean {
    return !entrega.assinatura_url && !this.temFotos(entrega);
  }

  private valorNumerico(valor?: string | null): number {
    if (!valor) return 0;

    const texto = valor.toString().trim();

    if (texto.includes(',') && texto.includes('.')) {
      const normalizadoBr = texto.replace(/\./g, '').replace(',', '.');
      const numeroBr = Number(normalizadoBr);
      return Number.isFinite(numeroBr) ? numeroBr : 0;
    }

    const normalizado = texto.replace(',', '.');
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
  }
}
