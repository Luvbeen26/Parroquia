import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePublicacion } from './create-publicacion';

describe('CreatePublicacion', () => {
  let component: CreatePublicacion;
  let fixture: ComponentFixture<CreatePublicacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePublicacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePublicacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
