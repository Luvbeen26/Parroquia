import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Eventosadmin } from './eventosadmin';

describe('Eventosadmin', () => {
  let component: Eventosadmin;
  let fixture: ComponentFixture<Eventosadmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Eventosadmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Eventosadmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
