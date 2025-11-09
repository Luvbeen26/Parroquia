import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReUploadDoc } from './re-upload-doc';

describe('ReUploadDoc', () => {
  let component: ReUploadDoc;
  let fixture: ComponentFixture<ReUploadDoc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReUploadDoc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReUploadDoc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
