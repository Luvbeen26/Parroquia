import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormParroquial } from './form-parroquial';

describe('FormParroquial', () => {
  let component: FormParroquial;
  let fixture: ComponentFixture<FormParroquial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormParroquial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormParroquial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
