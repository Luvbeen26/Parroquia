import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPadresMatrimonio } from './form-padres-matrimonio';

describe('FormPadresMatrimonio', () => {
  let component: FormPadresMatrimonio;
  let fixture: ComponentFixture<FormPadresMatrimonio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPadresMatrimonio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPadresMatrimonio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
