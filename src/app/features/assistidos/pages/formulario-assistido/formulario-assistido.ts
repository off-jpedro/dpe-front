import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ChangeDetectorRef,
  inject
} from '@angular/core'; import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { AssistidoService } from '../../../../core/services/assistido.service';
import { CreateAssistidoRequest, AssistidoResponse, UpdateAssistidoRequest } from '../../models/assistido.model';

@Component({
  selector: 'app-formulario-assistido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-assistido.html',
  styleUrl: './formulario-assistido.scss'
})
export class FormularioAssistido implements OnInit {

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly assistidoService = inject(AssistidoService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  isEdicao = false;
  assistidoId: string | null = null;

  enviando = false;
  errorMessage = '';
  cpfServerError = '';

  private readonly rendaMaxima = 9999999999.99;

  readonly form = this.fb.group({
    nomeCompleto: ['', [
      Validators.required,
      Validators.maxLength(200)
    ]],

    cpf: ['', [
      Validators.required,
      cpfValidator()
    ]],

    dataNascimento: ['', Validators.required],

    telefonePrincipal: ['', [
      Validators.required,
      Validators.maxLength(20),
      Validators.pattern(/^[0-9()+\-\s]+$/)
    ]],

    rendaMensal: [0, [
      Validators.required,
      Validators.min(0),
      Validators.max(this.rendaMaxima)
    ]],

    email: ['', [
      Validators.email,
      Validators.maxLength(254)
    ]],

    nacionalidade: ['Brasileira', [
      Validators.required,
      Validators.maxLength(100)
    ]],

    situacaoDeRua: [false],

    endereco: this.fb.group({
      logradouro: ['', Validators.maxLength(200)],
      numero: ['', Validators.maxLength(20)],
      complemento: ['', Validators.maxLength(100)],
      bairro: ['', Validators.maxLength(100)],
      cidade: ['', Validators.maxLength(100)],
      estado: ['', [
        Validators.maxLength(2),
        Validators.pattern(/^[A-Za-z]{2}$/)
      ]],
      cep: ['', [
        Validators.pattern(/^(\d{5}-?\d{3})$/)
      ]]
    })
  });

  constructor() {
    this.atualizarValidacoesEndereco(false);

    this.form.controls.cpf.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cpfServerError = '';
        this.errorMessage = '';
      });

    this.form.controls.situacaoDeRua.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((situacaoDeRua) => {
        this.atualizarValidacoesEndereco(situacaoDeRua);
      });
  }

  ngOnInit(): void {
    this.assistidoId = this.route.snapshot.paramMap.get('id');
    this.isEdicao = !!this.assistidoId;

    if (this.isEdicao && this.assistidoId) {
      this.carregarAssistido(this.assistidoId);
    }
  }

  private carregarAssistido(id: string): void {
    this.enviando = true;

    this.assistidoService.findById(id)
      .pipe(
        finalize(() => {
          this.enviando = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (assistido: AssistidoResponse) => {
          this.preencherFormulario(assistido);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao buscar assistido:', error);

          this.errorMessage =
            'Não foi possível carregar os dados do assistido.';

          this.cdr.markForCheck();
        }
      });
  }

  private preencherFormulario(assistido: AssistidoResponse): void {
    this.form.patchValue({
      nomeCompleto: assistido.nomeCompleto,
      cpf: assistido.cpf,
      dataNascimento: assistido.dataNascimento,
      telefonePrincipal: assistido.telefonePrincipal,
      rendaMensal: assistido.rendaMensal,
      email: assistido.email ?? '',
      nacionalidade: assistido.nacionalidade,
      situacaoDeRua: assistido.situacaoDeRua,
      endereco: {
        logradouro: assistido.endereco?.logradouro ?? '',
        numero: assistido.endereco?.numero ?? '',
        complemento: assistido.endereco?.complemento ?? '',
        bairro: assistido.endereco?.bairro ?? '',
        cidade: assistido.endereco?.cidade ?? '',
        estado: assistido.endereco?.estado ?? '',
        cep: assistido.endereco?.cep ?? ''
      }
    });

    this.atualizarValidacoesEndereco(assistido.situacaoDeRua);
    this.form.updateValueAndValidity();
  }

  limitarRenda(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.value === '') {
      return;
    }

    const valor = Number(input.value);

    if (valor > this.rendaMaxima) {
      input.value = String(this.rendaMaxima);

      this.form.controls.rendaMensal.setValue(this.rendaMaxima);
    }
  }

  somenteNumerosCpf(event: Event): void {
    const input = event.target as HTMLInputElement;

    const cpf = input.value.replace(/\D/g, '').slice(0, 11);

    input.value = cpf;

    this.form.controls.cpf.setValue(cpf);
  }

  private atualizarValidacoesEndereco(situacaoDeRua: boolean): void {

    const endereco = this.form.controls.endereco;

    const regrasEndereco: Record<string, ValidatorFn[]> = {
      logradouro: [Validators.maxLength(200)],
      numero: [Validators.maxLength(20)],
      bairro: [Validators.maxLength(100)],
      cidade: [Validators.maxLength(100)],
      estado: [
        Validators.maxLength(2),
        Validators.pattern(/^[A-Za-z]{2}$/)
      ],
      cep: [
        Validators.pattern(/^(\d{5}-?\d{3})$/)
      ]
    };

    Object.entries(regrasEndereco).forEach(([campo, validadores]) => {

      const control = endereco.get(campo);

      if (!control) {
        return;
      }

      if (situacaoDeRua) {
        control.setValidators(validadores);
      } else {
        control.setValidators([
          Validators.required,
          ...validadores
        ]);
      }

      control.updateValueAndValidity({
        emitEvent: false
      });
    });

    if (situacaoDeRua) {
      endereco.reset({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      });
    }

    endereco.updateValueAndValidity({
      emitEvent: false
    });
  }

  salvar(): void {
    this.errorMessage = '';
    this.cpfServerError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.enviando) {
      return;
    }

    const formValue = this.form.getRawValue();

    const dados = {
      nomeCompleto: formValue.nomeCompleto.trim(),
      cpf: formValue.cpf,
      dataNascimento: formValue.dataNascimento,
      telefonePrincipal: formValue.telefonePrincipal.trim(),
      rendaMensal: Number(formValue.rendaMensal),
      email: formValue.email.trim() || null,
      nacionalidade: formValue.nacionalidade,
      situacaoDeRua: formValue.situacaoDeRua,
      endereco: formValue.situacaoDeRua
        ? null
        : {
          logradouro: formValue.endereco.logradouro.trim(),
          numero: formValue.endereco.numero.trim(),
          complemento: formValue.endereco.complemento.trim(),
          bairro: formValue.endereco.bairro.trim(),
          cidade: formValue.endereco.cidade.trim(),
          estado: formValue.endereco.estado.trim().toUpperCase(),
          cep: formValue.endereco.cep.replace(/\D/g, '')
        }
    };

    this.enviando = true;

    const requisicao = this.isEdicao && this.assistidoId
      ? this.assistidoService.update(
        this.assistidoId,
        dados as UpdateAssistidoRequest
      )
      : this.assistidoService.create(
        dados as CreateAssistidoRequest
      );

    requisicao
      .pipe(
        finalize(() => {
          this.enviando = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },

        error: (error: HttpErrorResponse) => {
          console.error('Erro ao salvar assistido:', error);

          const resposta = error.error;

          const mensagemApi =
            typeof resposta === 'string'
              ? resposta
              : resposta?.message;

          if (error.status === 409) {
            const mensagem =
              mensagemApi ??
              'Já existe um assistido cadastrado com este CPF.';

            this.cpfServerError = mensagem;
            this.errorMessage = mensagem;
            this.form.controls.cpf.markAsTouched();
            this.cdr.markForCheck();

            return;
          }

          if (error.status === 400) {
            const erros = resposta?.validationErrors;

            if (erros?.cpf) {
              this.cpfServerError = erros.cpf;
              this.form.controls.cpf.markAsTouched();
            }

            this.errorMessage =
              mensagemApi ??
              'Os dados informados são inválidos. Verifique os campos.';

            this.cdr.markForCheck();
            return;
          }

          this.errorMessage =
            mensagemApi ??
            `Não foi possível ${this.isEdicao ? 'atualizar' : 'cadastrar'} o assistido. Tente novamente.`;

          this.cdr.markForCheck();
        }
      });
  }

  voltar(): void {
    this.router.navigate(['/']);
  }
}

function cpfValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const cpf = String(control.value ?? '').replace(/\D/g, '');

    if (!cpf) {
      return null;
    }

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return { cpfInvalido: true };
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(cpf[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;
    digito = digito === 10 ? 0 : digito;

    if (digito !== Number(cpf[9])) {
      return { cpfInvalido: true };
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(cpf[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;
    digito = digito === 10 ? 0 : digito;

    return digito === Number(cpf[10])
      ? null
      : { cpfInvalido: true };
  };

}