# DPE-GO — Cadastro de Assistidos

Frontend desenvolvido em **Angular** para gerenciamento de assistidos, permitindo realizar cadastros, consultas, atualizações e controle de situação dos registros.

O projeto faz parte de uma aplicação com backend desenvolvido em Java e Spring Boot, utilizando PostgreSQL para persistência dos dados.

## Funcionalidades

- **Cadastro de assistidos:** registro de informações pessoais, contato, renda e endereço.
- **Listagem de assistidos:** visualização dos registros cadastrados.
- **Pesquisa e filtros:** localização de registros por informações cadastrais e situação.
- **Edição:** atualização dos dados de assistidos cadastrados.
- **Inativação:** alteração da situação do cadastro sem remover os dados do banco.
- **Reativação:** recuperação de cadastros inativos.
- **Exclusão permanente:** remoção definitiva de cadastros inativos.
- **Paginação:** organização dos registros em páginas.
- **Validação de formulários:** validação de campos obrigatórios, CPF, e-mail e demais informações.

## Tecnologias utilizadas

- Angular
- TypeScript
- HTML5
- SCSS
- RxJS
- Angular Reactive Forms
- Angular Router
- Angular Signals
- HTTP Client

## Estrutura do projeto

```text
src/
└── app/
    ├── core/
    │   └── services/
    │       └── assistido.service.ts
    │
    ├── features/
    │   └── assistidos/
    │       ├── models/
    │       │   └── assistido.model.ts
    │       │
    │       └── pages/
    │           ├── formulario-assistido/
    │           │   ├── formulario-assistido.html
    │           │   ├── formulario-assistido.scss
    │           │   └── formulario-assistido.ts
    │           │
    │           └── listagem-assistidos/
    │               ├── listagem-assistidos.html
    │               ├── listagem-assistidos.scss
    │               └── listagem-assistidos.ts
    │
    ├── app.config.ts
    ├── app.routes.ts
    └── app.html
```

### Organização

- **Core:** serviços compartilhados e comunicação com a API.
- **Features:** funcionalidades organizadas por domínio.
- **Models:** interfaces e modelos utilizados pela aplicação.
- **Pages:** componentes responsáveis pelas telas do sistema.

## Pré-requisitos

Para executar o projeto localmente, é necessário ter instalado:

- Node.js
- npm
- Angular CLI

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU-USUARIO/dpe-go-assistido-frontend.git
```

### 2. Entrar na pasta do projeto

```bash
cd dpe-frontend
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Executar a aplicação

```bash
ng serve
```

A aplicação ficará disponível em:

```text
http://localhost:4200
```

## Integração com o Backend

O frontend realiza a comunicação com uma API REST desenvolvida em Java e Spring Boot.

Endpoint base:

```text
http://localhost:8080/api/assistidos
```

Para utilizar todas as funcionalidades, o backend deverá estar em execução e acessível pela aplicação.

## Observações

- A aplicação utiliza UUID para identificação dos assistidos.
- A inativação preserva os registros no banco de dados.
- A exclusão permanente é destinada exclusivamente aos cadastros inativos.
- Os dados são persistidos pelo backend, não diretamente pelo frontend.

---

**Projeto:** DPE-GO — Cadastro de Assistidos  
**Frontend:** Angular  
**Backend:** Java + Spring Boot  
**Banco de dados:** PostgreSQL