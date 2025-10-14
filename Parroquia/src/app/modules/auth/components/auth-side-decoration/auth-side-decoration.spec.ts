import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSideDecoration } from './auth-side-decoration';

describe('AuthSideDecoration', () => {
  let component: AuthSideDecoration;
  let fixture: ComponentFixture<AuthSideDecoration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSideDecoration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSideDecoration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
