import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPadrinosMatrimonio } from './form-padrinos-matrimonio';

describe('FormPadrinosMatrimonio', () => {
  let component: FormPadrinosMatrimonio;
  let fixture: ComponentFixture<FormPadrinosMatrimonio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPadrinosMatrimonio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPadrinosMatrimonio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
