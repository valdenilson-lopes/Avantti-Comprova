import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent
} from '@coreui/angular';
import { Entrega } from '../../../core/models/entrega.model';
import { EntregaService } from '../../../core/services/entrega.service';

interface AnexoEntrega {
  nome: string;
  url: string;
  tipo: 'foto' | 'assinatura' | 'anexo';
  bruto?: any;
}

@Component({
  selector: 'app-detalhe-entrega',
  standalone: true,
  templateUrl: './detalhe-entrega.component.html',
  styleUrls: ['./detalhe-entrega.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    BadgeComponent,
    ButtonDirective,
    SpinnerComponent
  ]
})
export class DetalheEntregaComponent implements OnInit {
  entrega: Entrega | null = null;
  anexos: AnexoEntrega[] = [];
  anexoSelecionado: AnexoEntrega | null = null;

  carregando = false;
  erro = '';

  constructor(
    private route: ActivatedRoute,
    public entregaService: EntregaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  async carregar(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.erro = 'Entrega não informada.';
      return;
    }

    this.carregando = true;
    this.erro = '';

    try {
      this.entrega = await this.entregaService.buscarPorId(id);

      if (!this.entrega) {
        this.erro = 'Entrega não encontrada.';
        this.anexos = [];
        return;
      }

      this.montarAnexos();
    } catch (error) {
      console.error('Erro ao carregar detalhe da entrega:', error);
      this.erro = 'Não foi possível carregar os detalhes da entrega.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  montarAnexos(): void {
    const lista: AnexoEntrega[] = [];

    const fotos = this.normalizarFotos(this.entrega?.fotos);

    fotos.forEach((foto, index) => {
      const url = this.extrairUrl(foto);

      if (url) {
        lista.push({
          nome: this.extrairNome(foto, `Foto ${index + 1}`),
          url,
          tipo: 'foto',
          bruto: foto
        });
      }
    });

    if (this.entrega?.assinatura_url) {
      lista.push({
        nome: 'Assinatura do recebedor',
        url: this.entrega.assinatura_url,
        tipo: 'assinatura'
      });
    }

    this.anexos = lista;
    this.anexoSelecionado = this.anexos.length > 0 ? this.anexos[0] : null;
  }

  normalizarFotos(fotos: any): any[] {
    if (!fotos) {
      return [];
    }

    if (Array.isArray(fotos)) {
      return fotos;
    }

    if (typeof fotos === 'string') {
      try {
        const parsed = JSON.parse(fotos);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return fotos.trim() ? [fotos] : [];
      }
    }

    return [fotos];
  }

  extrairUrl(foto: any): string {
    if (!foto) {
      return '';
    }

    if (typeof foto === 'string') {
      return foto;
    }

    return foto.url ||
      foto.publicUrl ||
      foto.public_url ||
      foto.signedUrl ||
      foto.signed_url ||
      foto.path ||
      foto.arquivo ||
      foto.file ||
      foto.storage_url ||
      foto.downloadUrl ||
      '';
  }

  extrairNome(foto: any, nomePadrao: string): string {
    if (!foto || typeof foto === 'string') {
      return nomePadrao;
    }

    return foto.nome ||
      foto.name ||
      foto.filename ||
      foto.fileName ||
      foto.descricao ||
      foto.tipo ||
      nomePadrao;
  }

  selecionarAnexo(anexo: AnexoEntrega): void {
    this.anexoSelecionado = anexo;
  }

  abrirAnexo(anexo?: AnexoEntrega | null): void {
    if (!anexo?.url) {
      return;
    }

    window.open(anexo.url, '_blank');
  }

  copiarLink(anexo?: AnexoEntrega | null): void {
    if (!anexo?.url) {
      return;
    }

    navigator.clipboard?.writeText(anexo.url);
  }

  temAnexos(): boolean {
    return this.anexos.length > 0;
  }

  valorTotalNumero(): number {
    const valor = this.entrega?.valor_total;

    if (!valor) {
      return 0;
    }

    const texto = String(valor).trim();

    if (texto.includes(',') && texto.includes('.')) {
      return Number(texto.replace(/\./g, '').replace(',', '.')) || 0;
    }

    return Number(texto.replace(',', '.')) || 0;
  }

  get possuiCanhoto(): boolean {
    return this.temAnexos();
  }
}
