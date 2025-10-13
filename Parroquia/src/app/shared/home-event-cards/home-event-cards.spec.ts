import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeEventCards } from './home-event-cards';

describe('HomeEventCards', () => {
  let component: HomeEventCards;
  let fixture: ComponentFixture<HomeEventCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEventCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeEventCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
