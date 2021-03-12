import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appConfig } from '../../app/app.module';
import { SignInComponent } from './sign-in.component';
import { SignInEmailUiComponent } from '../sign-in-email-ui/sign-in-email-ui.component';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignInComponent, SignInEmailUiComponent],
      providers: appConfig.providers,
      imports: appConfig.imports,
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
