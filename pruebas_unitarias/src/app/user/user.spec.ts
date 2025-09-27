import { ComponentFixture, TestBed } from '@angular/core/testing';

import { User } from './user';

describe('User', () => { //describe Un texto que describe la prueba y se muestra en los resultados
  let component: User;
  let fixture: ComponentFixture<User>;

  beforeEach(async () => { //se ejecuta antes de cada una de las pruebas, esto permite crear un entorno independiente, encapsulado y realista de la aplicación.
    await TestBed.configureTestingModule({
      imports: [User]
    })
    .compileComponents();

    fixture = TestBed.createComponent(User);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Deberia crearse, el usuario debe salir primero inactivo', () => { //esta es la prueba en sí
    expect(component).toBeTruthy(); //bloque de código que sera ejecutado para examinar un elemento o conducta en particular.
  });

  it("Activar usuario",() =>{
    expect(component.Activar).toBeTruthy();
  })
});
