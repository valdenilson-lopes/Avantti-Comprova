import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
import { Entrega } from '../../../core/models/entrega.model';
import { EntregaService } from '../../../core/services/entrega.service';

@Component({
  selector: 'app-monitor-entregas',
  standalone: true,
  templateUrl: './monitor-entregas.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
export class MonitorEntregasComponent implements OnInit {
  entregas: Entrega[] = [];
  entregasFiltradas: Entrega[] = [];
  entregasPaginadas: Entrega[] = [];

  carregando = false;
  erro = '';
  filtroTexto = '';
  filtroStatus = '';

  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 1;

  constructor(
    public entregaService: EntregaService,
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
      this.entregas = await this.entregaService.listar({}, 5000);
      this.aplicarFiltros(false);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
      this.erro = 'Não foi possível carregar as entregas.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  aplicarFiltros(forcarDetectChanges = true): void {
    const texto = this.filtroTexto.trim().toLowerCase();
    const status = this.filtroStatus.trim().toLowerCase();

    this.entregasFiltradas = this.entregas.filter((entrega) => {
      const encontrouTexto = !texto ||
        (entrega.numero_nf || '').toLowerCase().includes(texto) ||
        (entrega.numero_documento || '').toLowerCase().includes(texto) ||
        (entrega.cliente || '').toLowerCase().includes(texto) ||
        (entrega.cidade || '').toLowerCase().includes(texto) ||
        (entrega.chave_nfe || '').toLowerCase().includes(texto) ||
        (entrega.motorista_responsavel || '').toLowerCase().includes(texto);

      const encontrouStatus = !status || (entrega.status || '').toLowerCase() === status;

      return encontrouTexto && encontrouStatus;
    });

    this.paginaAtual = 1;
    this.atualizarPaginacao(false);

    if (forcarDetectChanges) {
      this.cdr.detectChanges();
    }
  }

  atualizarPaginacao(forcarDetectChanges = true): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.entregasFiltradas.length / this.itensPorPagina));

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.entregasPaginadas = this.entregasFiltradas.slice(inicio, fim);

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
    if (this.entregasFiltradas.length === 0) {
      return 0;
    }

    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get registroFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.entregasFiltradas.length);
  }
}
