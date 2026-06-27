export type StatusEntrega = 'open' | 'delivered' | 'partial' | 'returned' | 'problem' | 'cancelled' | string;

export interface Entrega {
  id: string;
  nfe_xml_id?: string | null;
  chave_nfe: string;
  numero_nf?: string | null;
  cliente?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  status?: StatusEntrega | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
  serie?: string | null;
  data_emissao?: string | null;
  cnpj_emitente?: string | null;
  nome_emitente?: string | null;
  cnpj_destinatario?: string | null;
  bairro_destinatario?: string | null;
  cep_destinatario?: string | null;
  valor_total?: string | null;
  natureza_operacao?: string | null;
  cnpj_empresa?: string | null;
  filial_id?: string | null;
  codfilial?: string | null;
  cnpj_filial?: string | null;
  modelo_documento?: string | null;
  serie_documento?: string | null;
  numero_documento?: string | null;
  competencia?: string | null;
  fotos?: string[] | null;
  observacao?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  motorista_responsavel?: string | null;
  integracao_lote?: string | null;
  assinatura_url?: string | null;
}

export interface EntregaFiltro {
  texto?: string;
  status?: string;
  cidade?: string;
  uf?: string;
  motorista?: string;
  cnpjEmpresa?: string;
  codfilial?: string;
  dataInicial?: string;
  dataFinal?: string;
  somenteSemCanhoto?: boolean;
}

export interface DashboardEntregasResumo {
  total: number;
  abertas: number;
  entregues: number;
  ocorrencias: number;
  parciais: number;
  devolucoes: number;
  semCanhoto: number;
  comFotos: number;
  valorTotal: number;
}

export interface EntregaPorStatus {
  status: string;
  quantidade: number;
}

export interface EntregaPorCidade {
  cidade: string;
  uf?: string | null;
  quantidade: number;
}

export interface NfeProcessLog {
  id: string;
  chave_nfe: string;
  status: string;
  mensagem?: string | null;
  criado_em?: string | null;
}

export interface NotificacaoLog {
  id: string;
  entrega_id?: string | null;
  cnpj?: string | null;
  motorista?: string | null;
  email_destino?: string | null;
  whatsapp_links?: string[] | null;
  status_envio?: string | null;
  mensagem?: string | null;
  criado_em?: string | null;
}
