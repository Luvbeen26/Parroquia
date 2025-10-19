import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDocuments } from './form-documents';

describe('FormDocuments', () => {
  let component: FormDocuments;
  let fixture: ComponentFixture<FormDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
