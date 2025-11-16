import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAdminevents } from './card-adminevents';

describe('CardAdminevents', () => {
  let component: CardAdminevents;
  let fixture: ComponentFixture<CardAdminevents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAdminevents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardAdminevents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
