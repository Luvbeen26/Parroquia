import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilContenedor } from './perfil-contenedor';

describe('PerfilContenedor', () => {
  let component: PerfilContenedor;
  let fixture: ComponentFixture<PerfilContenedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilContenedor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilContenedor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
