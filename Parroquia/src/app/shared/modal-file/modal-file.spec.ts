import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFile } from './modal-file';

describe('ModalFile', () => {
  let component: ModalFile;
  let fixture: ComponentFixture<ModalFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
