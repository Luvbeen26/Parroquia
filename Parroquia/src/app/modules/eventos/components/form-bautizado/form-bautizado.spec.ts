import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBautizado } from './form-bautizado';

describe('FormBautizado', () => {
  let component: FormBautizado;
  let fixture: ComponentFixture<FormBautizado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBautizado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormBautizado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
