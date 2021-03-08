import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInEmailUiComponent } from './sign-in-email-ui.component';

describe('SignInEmailUiComponent', () => {
  let component: SignInEmailUiComponent;
  let fixture: ComponentFixture<SignInEmailUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignInEmailUiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInEmailUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
