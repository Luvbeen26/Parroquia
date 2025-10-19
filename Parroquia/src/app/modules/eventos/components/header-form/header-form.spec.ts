import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderForm } from './header-form';

describe('HeaderForm', () => {
  let component: HeaderForm;
  let fixture: ComponentFixture<HeaderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
