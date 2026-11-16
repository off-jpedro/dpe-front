import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioAssistido } from './formulario-assistido';

describe('FormularioAssistido', () => {
  let component: FormularioAssistido;
  let fixture: ComponentFixture<FormularioAssistido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAssistido],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioAssistido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
