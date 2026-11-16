
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AssistidoResponse,
  CreateAssistidoRequest,
  UpdateAssistidoRequest,
  PageResponse,
  AssistidoListagemParams
} from '../../features/assistidos/models/assistido.model';

@Injectable({
  providedIn: 'root'
})
export class AssistidoService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/assistidos';

  create(request: CreateAssistidoRequest): Observable<AssistidoResponse> {
    return this.http.post<AssistidoResponse>(this.apiUrl, request);
  }

  findById(id: string): Observable<AssistidoResponse> {
    return this.http.get<AssistidoResponse>(`${this.apiUrl}/${id}`);
  }

  update(
    id: string,
    request: UpdateAssistidoRequest
  ): Observable<AssistidoResponse> {
    return this.http.put<AssistidoResponse>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  findAll(
    filtros: AssistidoListagemParams
  ): Observable<PageResponse<AssistidoResponse>> {
    const params = this.criarParametros(filtros);

    return this.http.get<PageResponse<AssistidoResponse>>(
      `${this.apiUrl}/todos`,
      { params }
    );
  }

  findActive(
    filtros: AssistidoListagemParams
  ): Observable<PageResponse<AssistidoResponse>> {
    const params = this.criarParametros(filtros);

    return this.http.get<PageResponse<AssistidoResponse>>(
      this.apiUrl,
      { params }
    );
  }

  findInactive(
    filtros: AssistidoListagemParams
  ): Observable<PageResponse<AssistidoResponse>> {
    const params = this.criarParametros(filtros);

    return this.http.get<PageResponse<AssistidoResponse>>(
      `${this.apiUrl}/inativos`,
      { params }
    );
  }

  reactivate(id: string): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/reativar`,
      {}
    );
  }

  deletePermanently(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}/permanente`
    );
  }

  private criarParametros(
    filtros: AssistidoListagemParams
  ): HttpParams {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('size', filtros.size)
      .set('sort', 'nomeCompleto,asc');

    if (filtros.nome) {
      params = params.set('nome', filtros.nome);
    }

    if (filtros.cpf) {
      params = params.set('cpf', filtros.cpf);
    }

    if (filtros.email) {
      params = params.set('email', filtros.email);
    }

    if (filtros.nacionalidade) {
      params = params.set('nacionalidade', filtros.nacionalidade);
    }

    if (filtros.cidade) {
      params = params.set('cidade', filtros.cidade);
    }

    if (filtros.situacaoDeRua !== undefined) {
      params = params.set(
        'situacaoDeRua',
        filtros.situacaoDeRua
      );
    }

    return params;
  }
}