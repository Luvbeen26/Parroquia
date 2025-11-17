import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Documentos } from './documentos';

describe('Documentos', () => {
  let component: Documentos;
  let fixture: ComponentFixture<Documentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Documentos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Documentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
