import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appConfig } from '../../app/app.module';
import { SignInProcessEmailLinkComponent } from './sign-in-process-email-link.component';

describe('SignInProcessEmailLinkComponent', () => {
  let component: SignInProcessEmailLinkComponent;
  let fixture: ComponentFixture<SignInProcessEmailLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignInProcessEmailLinkComponent],
      providers: appConfig.providers,
      imports: appConfig.imports,
    }).compileComponents();
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
