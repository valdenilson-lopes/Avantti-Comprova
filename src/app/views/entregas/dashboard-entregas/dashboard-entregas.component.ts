import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  BadgeComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { DashboardEntregasResumo, EntregaPorCidade, EntregaPorStatus } from '../../../core/models/entrega.model';
import { EntregaService } from '../../../core/services/entrega.service';

@Component({
  selector: 'app-dashboard-entregas',
  standalone: true,
  templateUrl: './dashboard-entregas.component.html',
  styleUrls: ['./dashboard-entregas.component.scss'],
  imports: [
    CommonModule,
    CurrencyPipe,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    BadgeComponent,
    SpinnerComponent,
    TableDirective
  ]
})
export class DashboardEntregasComponent implements OnInit {
  carregando = false;
  erro = '';

  resumo: DashboardEntregasResumo = {
    total: 0,
    abertas: 0,
    entregues: 0,
    ocorrencias: 0,
    parciais: 0,
    devolucoes: 0,
    semCanhoto: 0,
    comFotos: 0,
    valorTotal: 0
  };

  porStatus: EntregaPorStatus[] = [];
  porCidade: EntregaPorCidade[] = [];

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
      const [resumo, porStatus, porCidade] = await Promise.all([
        this.entregaService.obterResumo(),
        this.entregaService.obterPorStatus(),
        this.entregaService.obterPorCidade()
      ]);

      this.resumo = resumo;
      this.porStatus = porStatus;
      this.porCidade = porCidade;
    } catch (error) {
      console.error('Erro ao carregar dashboard de entregas:', error);
      this.erro = 'Não foi possível carregar o dashboard de entregas.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }
}
