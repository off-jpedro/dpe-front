import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListagemAssistidosComponent } from './listagem-assistidos';

describe('ListagemAssistidos', () => {
  let component: ListagemAssistidosComponent;
  let fixture: ComponentFixture<ListagemAssistidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemAssistidosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemAssistidosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
