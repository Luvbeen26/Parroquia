import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendientProcess } from './pendient-process';

describe('PendientProcess', () => {
  let component: PendientProcess;
  let fixture: ComponentFixture<PendientProcess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendientProcess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendientProcess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
