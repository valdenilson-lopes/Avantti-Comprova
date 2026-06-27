import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular';

import { Motorista } from '../../core/models/motorista.model';
import { MotoristaService } from '../../core/services/motorista.service';

@Component({
  selector: 'app-motoristas',
  templateUrl: './motoristas.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective
  ]
})
export class MotoristasComponent implements OnInit {

  motoristas: Motorista[] = [];
  carregando = false;
  mensagemErro = '';

  constructor(
    private motoristaService: MotoristaService
  ) {}

  async ngOnInit() {
    await this.carregarMotoristas();
  }

  async carregarMotoristas() {
    try {
      this.carregando = true;
      this.mensagemErro = '';

      this.motoristas = await this.motoristaService.listar();

  } catch (error: any) {
    console.error('Erro ao carregar motoristas:', error);
    this.mensagemErro = error?.message || 'Erro ao carregar motoristas.';
  } finally {
    this.carregando = false;
  }
  }
}
