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

type States = { sentTo: Set<string> } & (
  | {
      kind: 'enterEmail';
      defaultEmail: string;
    }
  | { kind: 'tryingAnonymous' }
  | { kind: 'anonymousError'; error: string }
  | { kind: 'anonymousSuccess' }
  | { kind: 'tryingEmail'; email: string; isResend: boolean }
  | {
      kind: 'emailError';
      isResend: boolean;
      email: string;
      error: string;
    }
  | { kind: 'emailSuccess'; email: string }
);

const isErrorState = (s: States) =>
  s.kind === 'anonymousError' || s.kind === 'emailError';

const initialState: States = {
  sentTo: new Set<string>(),
  kind: 'enterEmail',
  defaultEmail: '',
};

type Actions =
  | {
      kind: 'startEmail';
      email: string;
    }
  | {
      kind: 'sendAgain';
      email: string;
    }
  | {
      kind: 'startAnonymous';
    }
  | { kind: 'dismissError' }
  | { kind: 'anonymousError'; error: string }
  | { kind: 'anonymousSuccess' }
  | { kind: 'emailError'; error: string; email: string }
  | { kind: 'emailSent'; email: string }
  | { kind: 'useDifferentEmail' };

const send = (s: States, a: Actions): States => {
  switch (s.kind) {
    case 'enterEmail':
      switch (a.kind) {
        case 'startEmail': {
          return !s.sentTo.has(a.email)
            ? {
                kind: 'tryingEmail',
                email: a.email,
                sentTo: s.sentTo,
                isResend: false,
              }
            : {
                kind: 'emailSuccess',
                sentTo: s.sentTo,
                email: a.email,
              };
        }
        case 'startAnonymous':
          return {
            kind: 'tryingAnonymous',
            sentTo: s.sentTo,
          };
      }
      break;
    case 'tryingAnonymous':
      switch (a.kind) {
        case 'anonymousError':
          return {
            kind: 'anonymousError',
            error: a.error,
            sentTo: s.sentTo,
          };
        case 'anonymousSuccess':
          return {
            kind: 'anonymousSuccess',
            sentTo: s.sentTo,
          };
      }
      break;
    case 'tryingEmail':
      switch (a.kind) {
        case 'emailError':
          return {
            kind: 'emailError',
            email: a.email,
            error: a.error,
            sentTo: s.sentTo,
            isResend: s.isResend,
          };
        case 'emailSent':
          return {
            kind: 'emailSuccess',
            email: a.email,
            sentTo: s.sentTo.add(a.email),
          };
      }
      break;
    case 'anonymousSuccess':
      return s;
    case 'anonymousError':
      switch (a.kind) {
        case 'dismissError':
          return {
            kind: 'enterEmail',
            defaultEmail: '',
            sentTo: s.sentTo,
          };
      }
      break;
    case 'emailError':
      switch (a.kind) {
        case 'dismissError':
          return s.sentTo.has(s.email)
            ? { kind: 'emailSuccess', email: s.email, sentTo: s.sentTo }
            : { kind: 'enterEmail', sentTo: s.sentTo, defaultEmail: s.email };
      }
      break;
    case 'emailSuccess':
      switch (a.kind) {
        case 'useDifferentEmail':
          return {
            kind: 'enterEmail',
            defaultEmail: s.email,
            sentTo: s.sentTo,
          };
        case 'sendAgain':
          return {
            kind: 'tryingEmail',
            isResend: true,
            sentTo: s.sentTo,
            email: a.email,
          };
      }
      break;
  }
  return s;
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
  state: States;

  constructor(private dialogService: MatDialog) {
    this.emailControl = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);
    this.emailForm = new FormGroup({ email: this.emailControl });
    this.state = initialState;
    this.sendLinkRequest = new EventEmitter<string>();
    this.anonymousSigninRequest = new EventEmitter<unknown>();
    this.acceptingInvitation = false;
  }

  update(action: Actions) {
    const previousState = this.state;
    this.state = send(this.state, action);
    const wasError = isErrorState(previousState);
    const isError = isErrorState(this.state);
    if (action.kind === 'startAnonymous') {
      this.emailControl.setValue('');
      this.emailForm.reset();
    }
    if (wasError && !isError) {
      this.closeErrorDialog();
    }
    if (!wasError && isError) {
      this.openErrorDialog();
    }
    if (action.kind === 'startEmail' && this.state.kind === 'tryingEmail') {
      this.sendLinkRequest.emit(this.state.email);
    }
    if (action.kind === 'sendAgain') {
      this.sendLinkRequest.emit(action.email);
    }
    if (
      action.kind === 'startAnonymous' &&
      this.state.kind === 'tryingAnonymous'
    ) {
      this.anonymousSigninRequest.emit(true);
    }
  }

  isBusy() {
    return (
      this.state.kind === 'tryingAnonymous' || this.state.kind === 'tryingEmail'
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
        kind: 'startEmail',
        email: this.emailControl.value.trim(),
      });
    }
  }

  ngOnInit(): void {}
}
