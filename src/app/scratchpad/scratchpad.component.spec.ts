import { ComponentFixture, TestBed } from '@angular/core/testing';
import { appConfig } from '../../app/app.module';
import { ScratchpadComponent } from './scratchpad.component';
import { SignInEmailUiComponent } from '../../app/sign-in-email-ui/sign-in-email-ui.component';

describe('ScratchpadComponent', () => {
  let component: ScratchpadComponent;
  let fixture: ComponentFixture<ScratchpadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScratchpadComponent, SignInEmailUiComponent],
      imports: appConfig.imports,
      providers: appConfig.providers,
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScratchpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
