import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  Input,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

enum StateKind {
  enterEmail = 1,
  tryingAnonymous,
  anonymousErrorReported,
  anonymousSignInSuccess,
  tryingEmailSignin,
  emailErrorReported,
  emailSent,
  resendingEmail,
  resendingErrorReported,
}

// TODO Would all this be significantly shorter using xState?
type State = {
  sentTo: Set<string>;
} & (
  | { kind: StateKind.enterEmail; defaultEmail: string }
  | { kind: StateKind.tryingAnonymous }
  | { kind: StateKind.anonymousErrorReported; error: string }
  | { kind: StateKind.anonymousSignInSuccess }
  | { kind: StateKind.tryingEmailSignin; email: string }
  | { kind: StateKind.emailErrorReported; email: string; error: string }
  | { kind: StateKind.emailSent; email: string }
  | { kind: StateKind.resendingEmail; email: string }
  | { kind: StateKind.resendingErrorReported; email: string; error: string }
);

enum ActionKind {
  startAnonymousSignin = 1,
  requestEmailLink,
  reportEmailSent,
  reportEmailError,
  reportAnonymousSuccess,
  reportAnonymousError,
  dismissError,
  requestResendOfEmail,
  goBack,
}

type Action =
  | { action: ActionKind.startAnonymousSignin }
  | { action: ActionKind.requestEmailLink; email: string }
  | { action: ActionKind.reportEmailSent; email: string }
  | {
      action: ActionKind.reportEmailError;
      email: string;
      error: string;
    }
  | { action: ActionKind.reportAnonymousSuccess }
  | { action: ActionKind.reportAnonymousError; error: string }
  | { action: ActionKind.dismissError }
  | { action: ActionKind.requestResendOfEmail; email: string }
  | { action: ActionKind.goBack };

const initState: State = {
  sentTo: new Set<string>(),
  defaultEmail: '',
  kind: StateKind.enterEmail,
};

const update = (s: State, a: Action): State | undefined => {
  console.log(`STATE: ${s.kind} ACTION: ${a.action}`);
  switch (s.kind) {
    case StateKind.enterEmail:
      switch (a.action) {
        case ActionKind.requestEmailLink: {
          return s.sentTo.has(a.email)
            ? { ...s, kind: StateKind.emailSent, email: a.email }
            : {
                ...s,
                kind: StateKind.tryingEmailSignin,
                email: a.email,
              };
        }
        case ActionKind.startAnonymousSignin:
          return { ...s, kind: StateKind.tryingAnonymous };
        default:
          return undefined;
      }
    case StateKind.tryingAnonymous:
      switch (a.action) {
        case ActionKind.reportAnonymousError:
          return {
            ...s,
            kind: StateKind.anonymousErrorReported,
            error: a.error,
          };
        case ActionKind.reportAnonymousSuccess:
          return { ...s, kind: StateKind.anonymousSignInSuccess };
        default:
          return undefined;
      }
    case StateKind.anonymousErrorReported:
      switch (a.action) {
        case ActionKind.dismissError:
          return { ...s, kind: StateKind.enterEmail, defaultEmail: '' };
        default:
          return undefined;
      }
    case StateKind.tryingEmailSignin:
      switch (a.action) {
        case ActionKind.reportEmailSent:
          return {
            ...s,
            kind: StateKind.emailSent,
            email: a.email,
            sentTo: s.sentTo.add(a.email),
          };
        case ActionKind.reportEmailError:
          return {
            ...s,
            kind: StateKind.emailErrorReported,
            error: a.error,
            email: a.email,
          };
        default:
          return undefined;
      }
    case StateKind.emailErrorReported:
      switch (a.action) {
        case ActionKind.dismissError:
          return { ...s, kind: StateKind.enterEmail, defaultEmail: s.email };
        default:
          return undefined;
      }
    case StateKind.emailSent:
      switch (a.action) {
        case ActionKind.requestResendOfEmail:
          return { ...s, kind: StateKind.resendingEmail, email: s.email };
        case ActionKind.goBack:
          return { ...s, kind: StateKind.enterEmail, defaultEmail: s.email };
        default:
          return undefined;
      }
    case StateKind.resendingEmail:
      switch (a.action) {
        case ActionKind.reportEmailError:
          return {
            ...s,
            kind: StateKind.resendingErrorReported,
            email: a.email,
            error: a.error,
          };
        case ActionKind.reportEmailSent:
          return { ...s, kind: StateKind.emailSent, email: s.email };
        default:
          return undefined;
      }
    case StateKind.resendingErrorReported:
      switch (a.action) {
        case ActionKind.dismissError:
          return { ...s, kind: StateKind.emailSent };
        default:
          return undefined;
      }
    default:
      throw new Error('Unexpected state');
  }
};

@Component({
  selector: 'app-sign-in-email-ui',
  templateUrl: './sign-in-email-ui.component.html',
  styleUrls: ['./sign-in-email-ui.component.scss'],
})
export class SignInEmailUiComponent implements OnInit {
  @Output() sendLinkRequest: EventEmitter<string>;
  @Output() anonymousSigninRequest: EventEmitter<unknown>;
  @Input() acceptingInvitation: boolean;

  @ViewChild('errordialog')
  errorDialogTemplate?: TemplateRef<any>;
  errorDialogRef?: MatDialogRef<any, any>;
  emailControl: FormControl;
  emailForm: FormGroup;
  state: State;
  stateKind = StateKind;
  actionKind = ActionKind;

  constructor(private dialogService: MatDialog) {
    this.emailControl = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);
    this.emailForm = new FormGroup({ email: this.emailControl });
    this.state = initState;
    this.sendLinkRequest = new EventEmitter<string>();
    this.anonymousSigninRequest = new EventEmitter<unknown>();
    this.acceptingInvitation = false;
  }

  update(action: Action) {
    const nextState = update(this.state, action);
    if (nextState !== undefined) {
      this.state = nextState;
      switch (this.state.kind) {
        case this.stateKind.anonymousErrorReported:
        case this.stateKind.emailErrorReported:
        case this.stateKind.resendingErrorReported:
          this.openErrorDialog();
          break;
      }
      switch (action.action) {
        case ActionKind.dismissError:
          this.closeErrorDialog();
          break;
        case ActionKind.requestEmailLink:
          if (this.state.kind === StateKind.tryingEmailSignin) {
            this.sendLinkRequest.emit(action.email);
          }
          break;
        case ActionKind.requestResendOfEmail:
          this.sendLinkRequest.emit(action.email);
          break;
        case ActionKind.startAnonymousSignin:
          this.anonymousSigninRequest.emit(true);
          break;
      }
    }
  }

  isBusy() {
    return (
      this.state.kind === this.stateKind.tryingAnonymous ||
      this.state.kind === this.stateKind.tryingEmailSignin ||
      this.state.kind === this.stateKind.resendingEmail
    );
  }

  closeErrorDialog(): void {
    this.errorDialogRef?.close();
  }

  openErrorDialog(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.errorDialogRef = this.dialogService.open(this.errorDialogTemplate!, {
      disableClose: true,
      width: '40ch',
    });
  }

  submitEmailRequest() {
    if (this.emailForm.valid) {
      this.update({
        action: this.actionKind.requestEmailLink,
        email: this.emailControl.value.trim(),
      });
    }
  }

  ngOnInit(): void {}
}
