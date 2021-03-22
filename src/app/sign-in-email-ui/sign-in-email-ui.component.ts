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
import { Interpreter, Machine } from '../common/machine';

type States = { sentTo: Set<string> } & (
  | { state: 'enterEmail'; defaultEmail: string }
  | { state: 'tryingAnonymous' }
  | { state: 'anonymousError'; error: string }
  | { state: 'anonymousSuccess' }
  | { state: 'tryingEmail'; email: string; isResend: boolean }
  | {
      state: 'emailError';
      isResend: boolean;
      email: string;
      error: string;
    }
  | { state: 'emailSuccess'; email: string }
);

const machine: Machine<States, Actions> = {
  initial: {
    state: 'enterEmail',
    defaultEmail: '',
    sentTo: new Set<string>(),
  },
  states: {
    enterEmail: {
      startEmail: (s, e) =>
        s.sentTo.has(e.email)
          ? { state: 'emailSuccess', sentTo: s.sentTo, email: e.email }
          : {
              state: 'tryingEmail',
              email: e.email,
              isResend: false,
              sentTo: s.sentTo,
            },
      startAnonymous: (s, e) => ({
        state: 'tryingAnonymous',
        sentTo: s.sentTo,
      }),
    },
    tryingAnonymous: {
      anonymousError: (s, e) => ({
        state: 'anonymousError',
        error: e.error,
        sentTo: s.sentTo,
      }),
      anonymousSuccess: (s, e) => ({
        state: 'anonymousSuccess',
        sentTo: s.sentTo,
      }),
    },
    tryingEmail: {
      emailError: (s, e) => ({
        state: 'emailError',
        error: e.error,
        email: e.email,
        isResend: s.isResend,
        sentTo: s.sentTo,
      }),
      emailSent: (s, e) => ({
        state: 'emailSuccess',
        email: e.email,
        sentTo: s.sentTo.add(e.email),
      }),
    },
    anonymousError: {
      dismissError: (s, e) => ({
        state: 'enterEmail',
        defaultEmail: '',
        sentTo: s.sentTo,
      }),
    },
    emailError: {
      dismissError: (s, e) =>
        s.sentTo.has(s.email)
          ? { state: 'emailSuccess', email: s.email, sentTo: s.sentTo }
          : { state: 'enterEmail', sentTo: s.sentTo, defaultEmail: s.email },
    },
    emailSuccess: {
      useDifferentEmail: (s, e) => ({
        state: 'enterEmail',
        defaultEmail: s.email,
        sentTo: s.sentTo,
      }),
      sendAgain: (s, e) => ({
        state: 'tryingEmail',
        isResend: true,
        sentTo: s.sentTo,
        email: e.email,
      }),
    },
  },
};

type Actions =
  | { event: 'startEmail'; email: string }
  | { event: 'sendAgain'; email: string }
  | { event: 'startAnonymous' }
  | { event: 'dismissError' }
  | { event: 'anonymousError'; error: string }
  | { event: 'anonymousSuccess' }
  | { event: 'emailError'; error: string; email: string }
  | { event: 'emailSent'; email: string }
  | { event: 'useDifferentEmail' };

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
  interpreter: Interpreter<States, Actions, States['state'], Actions['event']>;

  constructor(private dialogService: MatDialog) {
    this.emailControl = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);
    this.emailForm = new FormGroup({ email: this.emailControl });
    this.sendLinkRequest = new EventEmitter<string>();
    this.anonymousSigninRequest = new EventEmitter<unknown>();
    this.acceptingInvitation = false;
    this.interpreter = new Interpreter(machine);
  }

  update(action: Actions) {
    this.interpreter.send(action);
    const isErrorState = (s: States) =>
      s.state === 'anonymousError' || s.state === 'emailError';
    const prev = this.interpreter.current.value.previous;
    const wasError = prev !== undefined && isErrorState(prev.state);
    const isError = isErrorState(this.state);
    if (action.event === 'startAnonymous') {
      this.emailControl.setValue('');
      this.emailForm.reset();
    }
    if (wasError && !isError) {
      this.closeErrorDialog();
    }
    if (!wasError && isError) {
      this.openErrorDialog();
    }
    if (action.event === 'startEmail' && this.state.state === 'tryingEmail') {
      this.sendLinkRequest.emit(this.state.email);
    }
    if (action.event === 'sendAgain') {
      this.sendLinkRequest.emit(action.email);
    }
    if (
      action.event === 'startAnonymous' &&
      this.state.state === 'tryingAnonymous'
    ) {
      this.anonymousSigninRequest.emit(true);
    }
  }

  get state() {
    return this.interpreter.current.value.state;
  }

  get isBusy() {
    return (
      this.state.state === 'tryingEmail' ||
      this.state.state === 'tryingAnonymous'
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
        event: 'startEmail',
        email: this.emailControl.value.trim(),
      });
    }
  }

  ngOnInit(): void {}
}
