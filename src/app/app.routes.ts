import { Routes } from '@angular/router';

import { ListagemAssistidosComponent } from './features/assistidos/pages/listagem-assistidos/listagem-assistidos';
import { FormularioAssistido } from './features/assistidos/pages/formulario-assistido/formulario-assistido';

export const routes: Routes = [
  {
    path: '',
    component: ListagemAssistidosComponent
  },
  {
    path: 'assistidos/novo',
    component: FormularioAssistido
  },
  {
    path: 'assistidos/:id/editar',
    component: FormularioAssistido
  },
  {
    path: '**',
    redirectTo: ''
  }
];
