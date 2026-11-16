
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DestroyRef } from '@angular/core';

import {
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Subject
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AssistidoService } from '../../../../core/services/assistido.service';
import {
  AssistidoResponse,
  AssistidoListagemParams
} from '../../models/assistido.model';

type FiltroStatus = 'todos' | 'ativos' | 'inativos';

@Component({
  selector: 'app-listagem-assistidos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './listagem-assistidos.html',
  styleUrl: './listagem-assistidos.scss'
})
export class ListagemAssistidosComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly assistidoService = inject(AssistidoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly pesquisa$ = new Subject<string>();

  // Registros recebidos da API para a página atual.
  assistidos = signal<AssistidoResponse[]>([]);

  // Pesquisa e filtros.
  termoPesquisa = signal('');
  filtroStatus = signal<FiltroStatus>('todos');

  // Paginação: a interface começa em 1, a API começa em 0.
  paginaAtual = signal(1);
  itensPorPagina = signal(5);

  // Totais gerais.
  totalAssistidos = signal(0);
  totalAtivos = signal(0);
  totalInativos = signal(0);

  // Estado da tela.
  carregando = signal(false);
  processandoAcao = signal(false);
  erro = signal<string | null>(null);

  // Assistido selecionado para confirmação de status.
  assistidoSelecionado = signal<AssistidoResponse | null>(null);

  assistidoParaExcluir = signal<AssistidoResponse | null>(null);

  // Metadados de paginação recebidos do backend.
  private totalPaginasApi = signal(0);

  // Mantém compatibilidade com os nomes usados no HTML atual.
  assistidosFiltrados = computed(() => this.assistidos());
  assistidosPaginados = computed(() => this.assistidos());

  totalPaginas = computed(() => this.totalPaginasApi());

  paginas = computed(() =>
    Array.from(
      { length: this.totalPaginas() },
      (_, index) => index + 1
    )
  );

  primeiroRegistro = computed(() => {
    if (this.assistidos().length === 0) {
      return 0;
    }

    return (this.paginaAtual() - 1) * this.itensPorPagina() + 1;
  });

  ultimoRegistro = computed(() =>
    Math.min(
      this.paginaAtual() * this.itensPorPagina(),
      this.totalRegistrosFiltrados()
    )
  );

  totalRegistrosFiltrados = signal(0);

  ngOnInit(): void {
    this.pesquisa$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.paginaAtual.set(1);
        this.carregarAssistidos();
      });

    this.carregarAssistidos();
    this.carregarResumo();
  }

  novoAssistido(): void {
    this.router.navigate(['/assistidos/novo']);
  }

  atualizarPesquisa(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.termoPesquisa.set(input.value);
    this.pesquisa$.next(input.value);
  }

  alterarFiltro(filtro: FiltroStatus): void {
    this.filtroStatus.set(filtro);
    this.paginaAtual.set(1);
    this.carregarAssistidos();
  }

  alterarItensPorPagina(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.itensPorPagina.set(Number(select.value));
    this.paginaAtual.set(1);
    this.carregarAssistidos();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual.set(pagina);
      this.carregarAssistidos();
    }
  }

  confirmarExclusaoPermanente(assistido: AssistidoResponse): void {
    if (assistido.ativo) {
      return;
    }

    this.assistidoParaExcluir.set(assistido);
  }

  cancelarExclusaoPermanente(): void {
    this.assistidoParaExcluir.set(null);
  }

  excluirPermanente(): void {
    const selecionado = this.assistidoParaExcluir();

    if (!selecionado || selecionado.ativo || this.processandoAcao()) {
      return;
    }

    this.processandoAcao.set(true);
    this.erro.set(null);

    this.assistidoService.deletePermanently(selecionado.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.assistidoParaExcluir.set(null);
          this.processandoAcao.set(false);

          this.carregarAssistidos();
          this.carregarResumo();
        },

        error: (erro) => {
          console.error('Erro ao excluir assistido permanentemente:', erro);

          this.processandoAcao.set(false);
          this.erro.set(
            'Não foi possível excluir permanentemente o assistido.'
          );
        }
      });
  }

  private criarFiltros(): AssistidoListagemParams {
    const termo = this.termoPesquisa().trim();

    const filtros: AssistidoListagemParams = {
      page: this.paginaAtual() - 1,
      size: this.itensPorPagina()
    };

    if (!termo) {
      return filtros;
    }

    // Se a pesquisa contém somente números e pontuação de CPF,
    // enviamos o filtro cpf. Caso contrário, enviamos nome.
    const pareceCpf = /^[\d.\-\s]+$/.test(termo);
    const cpf = termo.replace(/\D/g, '');

    if (pareceCpf && cpf.length > 0) {
      filtros.cpf = cpf;
    } else {
      filtros.nome = termo;
    }

    return filtros;
  }

  carregarAssistidos(): void {
    this.carregando.set(true);
    this.erro.set(null);

    const filtros = this.criarFiltros();

    let requisicao;

    switch (this.filtroStatus()) {
      case 'ativos':
        requisicao = this.assistidoService.findActive(filtros);
        break;

      case 'inativos':
        requisicao = this.assistidoService.findInactive(filtros);
        break;

      default:
        requisicao = this.assistidoService.findAll(filtros);
        break;
    }

    requisicao
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pagina) => {
          this.assistidos.set(pagina.content);
          this.totalRegistrosFiltrados.set(pagina.totalElements);
          this.totalPaginasApi.set(pagina.totalPages);
          this.carregando.set(false);
        },
        error: (erro) => {
          console.error('Erro ao carregar assistidos:', erro);

          this.assistidos.set([]);
          this.totalRegistrosFiltrados.set(0);
          this.totalPaginasApi.set(0);
          this.carregando.set(false);
          this.erro.set('Não foi possível carregar os assistidos.');
        }
      });
  }

  private carregarResumo(): void {
    const filtros: AssistidoListagemParams = {
      page: 0,
      size: 1
    };

    forkJoin({
      todos: this.assistidoService.findAll(filtros),
      ativos: this.assistidoService.findActive(filtros),
      inativos: this.assistidoService.findInactive(filtros)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resumo) => {
          this.totalAssistidos.set(resumo.todos.totalElements);
          this.totalAtivos.set(resumo.ativos.totalElements);
          this.totalInativos.set(resumo.inativos.totalElements);
        },
        error: (erro) => {
          console.error('Erro ao carregar resumo:', erro);
        }
      });
  }

  confirmarAlteracaoStatus(assistido: AssistidoResponse): void {
    this.assistidoSelecionado.set(assistido);
  }

  alterarStatus(): void {
    const selecionado = this.assistidoSelecionado();

    if (!selecionado || this.processandoAcao()) {
      return;
    }

    this.processandoAcao.set(true);

    const requisicao = selecionado.ativo
      ? this.assistidoService.delete(selecionado.id)
      : this.assistidoService.reactivate(selecionado.id);

    requisicao
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.assistidoSelecionado.set(null);
          this.processandoAcao.set(false);

          this.carregarAssistidos();
          this.carregarResumo();
        },
        error: (erro) => {
          console.error('Erro ao alterar status do assistido:', erro);

          this.processandoAcao.set(false);
          this.erro.set('Não foi possível alterar o status do assistido.');
        }
      });
  }

  cancelarAlteracaoStatus(): void {
    this.assistidoSelecionado.set(null);
  }

  editarAssistido(assistido: AssistidoResponse): void {
    this.router.navigate([
      '/assistidos',
      assistido.id,
      'editar'
    ]);
  }
}