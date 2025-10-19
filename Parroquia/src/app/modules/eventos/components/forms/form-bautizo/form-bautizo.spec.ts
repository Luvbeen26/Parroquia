import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBautizo } from './form-bautizo';

describe('FormBautizo', () => {
  let component: FormBautizo;
  let fixture: ComponentFixture<FormBautizo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBautizo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormBautizo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
