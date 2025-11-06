import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConPrim } from './form-con-prim';

describe('FormConPrim', () => {
  let component: FormConPrim;
  let fixture: ComponentFixture<FormConPrim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormConPrim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormConPrim);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
