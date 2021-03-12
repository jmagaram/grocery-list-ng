import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInEmailUiComponent } from './sign-in-email-ui.component';
import { appConfig } from '../../app/app.module';

describe('SignInEmailUiComponent', () => {
  let component: SignInEmailUiComponent;
  let fixture: ComponentFixture<SignInEmailUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignInEmailUiComponent],
      providers: appConfig.providers,
      imports: appConfig.imports,
    }).compileComponents();
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
