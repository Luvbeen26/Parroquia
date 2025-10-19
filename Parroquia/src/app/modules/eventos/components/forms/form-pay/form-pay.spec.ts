import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPay } from './form-pay';

describe('FormPay', () => {
  let component: FormPay;
  let fixture: ComponentFixture<FormPay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
