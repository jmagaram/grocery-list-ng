import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInProcessEmailLinkComponent } from './sign-in-process-email-link.component';

describe('SignInProcessEmailLinkComponent', () => {
  let component: SignInProcessEmailLinkComponent;
  let fixture: ComponentFixture<SignInProcessEmailLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignInProcessEmailLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInProcessEmailLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
