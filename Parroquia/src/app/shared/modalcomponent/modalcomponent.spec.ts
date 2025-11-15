import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modalcomponent } from './modalcomponent';

describe('Modalcomponent', () => {
  let component: Modalcomponent;
  let fixture: ComponentFixture<Modalcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modalcomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modalcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
