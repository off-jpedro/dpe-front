export interface EnderecoRequest {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface AssistidoRequest {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefonePrincipal: string;
  rendaMensal: number;
  email: string | null;
  nacionalidade: string;
  situacaoDeRua: boolean;
  endereco: EnderecoRequest | null;
}

export interface CreateAssistidoRequest extends AssistidoRequest {}

export interface UpdateAssistidoRequest extends AssistidoRequest {}

export interface AssistidoResponse {
  id: string;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefonePrincipal: string;
  rendaMensal: number;
  email: string | null;
  nacionalidade: string;
  situacaoDeRua: boolean;
  endereco: EnderecoRequest | null;
  ativo: boolean;
  aptoPeloCriterioDeRenda: boolean;
  createdAt: string;
}


export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AssistidoListagemParams {
  page: number;
  size: number;
  nome?: string;
  cpf?: string;
  email?: string;
  nacionalidade?: string;
  cidade?: string;
  situacaoDeRua?: boolean;
}