import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BadgeComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';

type ModoFormulario = 'novo' | 'editar' | 'senha';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    BadgeComponent,
    FormControlDirective,
    FormSelectDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    SpinnerComponent
  ]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuariosPaginados: Usuario[] = [];

  carregando = false;
  salvando = false;
  erro = '';
  sucesso = '';

  filtroTexto = '';
  filtroAtivo = '';
  filtroAdministrador = '';

  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 1;

  modalVisivel = false;
  modo: ModoFormulario = 'novo';

  usuarioSelecionado: Usuario = this.novoUsuario();
  novaSenha = '';
  confirmarSenha = '';

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando = true;
    this.erro = '';
    this.sucesso = '';

    try {
      this.usuarios = await this.usuarioService.listar({}, 5000);
      this.aplicarFiltros();
    } catch (error) {
      console.error(error);
      this.erro = 'Não foi possível carregar os usuários.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  aplicarFiltros(): void {
    const texto = this.filtroTexto.trim().toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter((usuario) => {
      const encontrouTexto = !texto ||
        (usuario.nome || '').toLowerCase().includes(texto) ||
        (usuario.usuario || '').toLowerCase().includes(texto) ||
        (usuario.email || '').toLowerCase().includes(texto);

      const encontrouAtivo =
        this.filtroAtivo === '' ||
        (this.filtroAtivo === 'S' && usuario.ativo === true) ||
        (this.filtroAtivo === 'N' && usuario.ativo === false);

      const encontrouAdministrador =
        this.filtroAdministrador === '' ||
        (this.filtroAdministrador === 'S' && usuario.administrador === true) ||
        (this.filtroAdministrador === 'N' && usuario.administrador === false);

      return encontrouTexto && encontrouAtivo && encontrouAdministrador;
    });

    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  atualizarPaginacao(): void {
    this.totalPaginas = Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.itensPorPagina));

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, fim);
    this.cdr.detectChanges();
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;

    this.paginaAtual = pagina;
    this.atualizarPaginacao();
  }

  alterarItensPorPagina(): void {
    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  abrirNovo(): void {
    this.modo = 'novo';
    this.usuarioSelecionado = this.novoUsuario();
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.erro = '';
    this.sucesso = '';
    this.modalVisivel = true;
  }

  abrirEditar(usuario: Usuario): void {
    this.modo = 'editar';
    this.usuarioSelecionado = { ...usuario, senha: '' };
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.erro = '';
    this.sucesso = '';
    this.modalVisivel = true;
  }

  abrirAlterarSenha(usuario: Usuario): void {
    this.modo = 'senha';
    this.usuarioSelecionado = { ...usuario, senha: '' };
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.erro = '';
    this.sucesso = '';
    this.modalVisivel = true;
  }

  fecharModal(): void {
    if (this.salvando) return;

    this.modalVisivel = false;
    this.erro = '';
  }

  async salvar(): Promise<void> {
    this.erro = '';
    this.sucesso = '';

    if (this.modo === 'senha') {
      await this.salvarSenha();
      return;
    }

    const validacao = this.validarUsuario();
    if (validacao) {
      this.erro = validacao;
      return;
    }

    this.salvando = true;

    try {
      const idIgnorar = this.modo === 'editar' ? this.usuarioSelecionado.id : undefined;
      const existe = await this.usuarioService.usuarioExiste(this.usuarioSelecionado.usuario, idIgnorar);

      if (existe) {
        this.erro = 'Já existe um usuário com esse login.';
        return;
      }

      if (this.modo === 'novo') {
        await this.usuarioService.criar(this.usuarioSelecionado);
        this.sucesso = 'Usuário cadastrado com sucesso.';
      } else {
        await this.usuarioService.atualizar(this.usuarioSelecionado.id!, {
          ...this.usuarioSelecionado,
          senha: ''
        });
        this.sucesso = 'Usuário atualizado com sucesso.';
      }

      this.modalVisivel = false;
      await this.carregar();
    } catch (error) {
      console.error(error);
      this.erro = 'Não foi possível salvar o usuário.';
    } finally {
      this.salvando = false;
      this.cdr.detectChanges();
    }
  }

  async salvarSenha(): Promise<void> {
    if (!this.usuarioSelecionado.id) {
      this.erro = 'Usuário inválido para alteração de senha.';
      return;
    }

    if (!this.novaSenha.trim()) {
      this.erro = 'Informe a nova senha.';
      return;
    }

    if (this.novaSenha.trim().length < 4) {
      this.erro = 'A senha deve possuir pelo menos 4 caracteres.';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.erro = 'A confirmação da senha não confere.';
      return;
    }

    this.salvando = true;

    try {
      await this.usuarioService.alterarSenha(this.usuarioSelecionado.id, this.novaSenha);
      this.sucesso = 'Senha alterada com sucesso.';
      this.modalVisivel = false;
    } catch (error) {
      console.error(error);
      this.erro = 'Não foi possível alterar a senha.';
    } finally {
      this.salvando = false;
      this.cdr.detectChanges();
    }
  }

  async alternarAtivo(usuario: Usuario): Promise<void> {
    if (!usuario.id) return;

    const novoStatus = !usuario.ativo;
    const acao = novoStatus ? 'ativar' : 'inativar';

    if (!confirm(`Deseja realmente ${acao} o usuário "${usuario.nome}"?`)) return;

    this.erro = '';
    this.sucesso = '';
    this.salvando = true;

    try {
      await this.usuarioService.atualizar(usuario.id, {
        ...usuario,
        ativo: novoStatus,
        senha: ''
      });

      this.sucesso = novoStatus
        ? 'Usuário ativado com sucesso.'
        : 'Usuário inativado com sucesso.';

      await this.carregar();
    } catch (error) {
      console.error(error);
      this.erro = `Não foi possível ${acao} o usuário.`;
    } finally {
      this.salvando = false;
      this.cdr.detectChanges();
    }
  }

  get tituloModal(): string {
    if (this.modo === 'novo') return 'Novo Usuário';
    if (this.modo === 'editar') return 'Alterar Usuário';
    return 'Alterar Senha';
  }

  get textoBotaoSalvar(): string {
    if (this.modo === 'novo') return 'Cadastrar';
    if (this.modo === 'editar') return 'Salvar Alterações';
    return 'Alterar Senha';
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas, this.paginaAtual + 2);

    for (let pagina = inicio; pagina <= fim; pagina++) paginas.push(pagina);
    return paginas;
  }

  get registroInicial(): number {
    if (this.usuariosFiltrados.length === 0) return 0;
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get registroFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.usuariosFiltrados.length);
  }

  private validarUsuario(): string {
    if (!this.usuarioSelecionado.nome.trim()) return 'Informe o nome.';
    if (!this.usuarioSelecionado.usuario.trim()) return 'Informe o usuário/login.';
    if (!this.usuarioSelecionado.email.trim()) return 'Informe o e-mail.';
    if (this.modo === 'novo' && !this.usuarioSelecionado.senha?.trim()) return 'Informe a senha.';
    if (this.modo === 'novo' && (this.usuarioSelecionado.senha?.trim().length || 0) < 4) return 'A senha deve possuir pelo menos 4 caracteres.';

    return '';
  }

  private novoUsuario(): Usuario {
    return {
      nome: '',
      usuario: '',
      email: '',
      senha: '',
      ativo: true,
      administrador: false
    };
  }
}
