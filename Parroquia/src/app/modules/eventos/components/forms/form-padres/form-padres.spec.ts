import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPadres } from './form-padres';

describe('FormPadres', () => {
  let component: FormPadres;
  let fixture: ComponentFixture<FormPadres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPadres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPadres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
