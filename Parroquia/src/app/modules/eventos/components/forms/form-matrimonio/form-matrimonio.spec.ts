import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMatrimonio } from './form-matrimonio';

describe('FormMatrimonio', () => {
  let component: FormMatrimonio;
  let fixture: ComponentFixture<FormMatrimonio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMatrimonio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormMatrimonio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
