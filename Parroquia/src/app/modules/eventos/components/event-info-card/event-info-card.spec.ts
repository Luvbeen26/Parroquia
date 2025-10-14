import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventInfoCard } from './event-info-card';

describe('EventInfoCard', () => {
  let component: EventInfoCard;
  let fixture: ComponentFixture<EventInfoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventInfoCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventInfoCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
