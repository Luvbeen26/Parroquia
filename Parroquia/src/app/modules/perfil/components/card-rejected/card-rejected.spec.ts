import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRejected } from './card-rejected';

describe('CardRejected', () => {
  let component: CardRejected;
  let fixture: ComponentFixture<CardRejected>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRejected]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardRejected);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
