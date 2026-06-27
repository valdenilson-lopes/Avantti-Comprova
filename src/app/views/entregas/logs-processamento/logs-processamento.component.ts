import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormSelectDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { ProcessamentoService } from '../../../core/services/processamento.service';

interface NfeProcessLog {
  id: string;
  chave_nfe: string;
  status: string;
  mensagem?: string | null;
  criado_em?: string | null;
}

@Component({
  selector: 'app-logs-processamento',
  standalone: true,
  templateUrl: './logs-processamento.component.html',
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    BadgeComponent,
    ButtonDirective,
    FormControlDirective,
    FormSelectDirective,
    SpinnerComponent
  ]
})
export class LogsProcessamentoComponent implements OnInit {
  logs: NfeProcessLog[] = [];
  logsFiltrados: NfeProcessLog[] = [];
  logsPaginados: NfeProcessLog[] = [];

  carregando = false;
  erro = '';
  filtroTexto = '';
  filtroStatus = '';

  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 1;

  constructor(
    private processamentoService: ProcessamentoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando = true;
    this.erro = '';
    this.cdr.detectChanges();

    try {
      this.logs = await this.processamentoService.listarLogsNfe(5000) as NfeProcessLog[];
      this.aplicarFiltros(false);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      this.erro = 'Não foi possível carregar os logs de processamento.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  aplicarFiltros(forcarDetectChanges = true): void {
    const texto = this.filtroTexto.trim().toLowerCase();
    const status = this.filtroStatus.trim().toLowerCase();

    this.logsFiltrados = this.logs.filter((log) => {
      const encontrouTexto = !texto ||
        (log.chave_nfe || '').toLowerCase().includes(texto) ||
        (log.mensagem || '').toLowerCase().includes(texto);

      const encontrouStatus = !status || (log.status || '').toLowerCase() === status;

      return encontrouTexto && encontrouStatus;
    });

    this.paginaAtual = 1;
    this.atualizarPaginacao(false);

    if (forcarDetectChanges) {
      this.cdr.detectChanges();
    }
  }

  atualizarPaginacao(forcarDetectChanges = true): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.logsFiltrados.length / this.itensPorPagina));

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.logsPaginados = this.logsFiltrados.slice(inicio, fim);

    if (forcarDetectChanges) {
      this.cdr.detectChanges();
    }
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }

    this.paginaAtual = pagina;
    this.atualizarPaginacao();
  }

  alterarItensPorPagina(): void {
    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  classeStatus(status?: string | null): string {
    switch ((status || '').toLowerCase()) {
      case 'processed':
      case 'success':
      case 'sucesso':
        return 'success';
      case 'error':
      case 'erro':
        return 'danger';
      case 'processing':
      case 'processando':
        return 'info';
      case 'pending':
      case 'pendente':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas, this.paginaAtual + 2);

    for (let pagina = inicio; pagina <= fim; pagina++) {
      paginas.push(pagina);
    }

    return paginas;
  }

  get registroInicial(): number {
    if (this.logsFiltrados.length === 0) {
      return 0;
    }

    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get registroFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.logsFiltrados.length);
  }
}
