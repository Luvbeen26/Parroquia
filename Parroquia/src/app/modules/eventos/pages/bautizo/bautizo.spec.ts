import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bautizo } from './bautizo';

describe('Bautizo', () => {
  let component: Bautizo;
  let fixture: ComponentFixture<Bautizo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bautizo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bautizo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
