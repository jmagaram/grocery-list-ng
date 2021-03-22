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

type States = {
  sentTo: Set<string>;
  email: string;
  invited: boolean;
} & (
  | { state: 'chooseEmailOrGuest' }
  | { state: 'guestInProgress' }
  | { state: 'guestError'; error: string }
  | { state: 'guestSuccess' }
  | { state: 'emailInProgress' }
  | { state: 'emailError'; error: string }
  | { state: 'emailSuccess' }
  | { state: 'resendInProgress' }
  | { state: 'resendError'; error: string }
);

const machine = (invited: boolean): Machine<States, Actions> => ({
  initial: {
    state: 'chooseEmailOrGuest',
    invited,
    email: '',
    sentTo: new Set<string>(),
  },
  states: {
    chooseEmailOrGuest: {
      chooseEmail: (s, e) => ({
        ...s,
        email: e.email,
        state: s.sentTo.has(e.email) ? 'emailSuccess' : 'emailInProgress',
      }),
      chooseGuest: (s, e) =>
        s.invited ? { ...s, state: 'guestInProgress' } : undefined,
    },
    guestInProgress: {
      guestError: (s, e) => ({
        ...s,
        state: 'guestError',
        error: e.error,
      }),
      guestSuccess: (s, e) => ({ ...s, state: 'guestSuccess' }),
    },
    guestError: {
      dismissError: (s, e) => ({ ...s, state: 'chooseEmailOrGuest' }),
    },
    emailInProgress: {
      emailError: (s, e) => ({ ...s, state: 'emailError', error: e.error }),
      emailSuccess: (s, e) => ({
        ...s,
        state: 'emailSuccess',
        sentTo: s.sentTo.add(s.email),
      }),
    },
    emailError: {
      dismissError: (s, e) => ({ ...s, state: 'chooseEmailOrGuest' }),
    },
    emailSuccess: {
      startOver: (s, e) => ({ ...s, state: 'chooseEmailOrGuest' }),
      resend: (s, e) => ({ ...s, state: 'resendInProgress' }),
    },
    resendInProgress: {
      emailError: (s, e) => ({ ...s, state: 'resendError', error: e.error }),
      emailSuccess: (s, e) => ({ ...s, state: 'emailSuccess' }),
    },
    resendError: {
      dismissError: (s, e) => ({ ...s, state: 'emailSuccess' }),
    },
  },
});

type Actions =
  | { event: 'chooseGuest' }
  | { event: 'chooseEmail'; email: string }
  | { event: 'resend' }
  | { event: 'dismissError' }
  | { event: 'guestError'; error: string }
  | { event: 'guestSuccess' }
  | { event: 'emailError'; error: string }
  | { event: 'emailSuccess' }
  | { event: 'startOver' };

@Component({
  selector: 'app-sign-in-email-ui',
  templateUrl: './sign-in-email-ui.component.html',
  styleUrls: ['./sign-in-email-ui.component.scss'],
})
export class SignInEmailUiComponent implements OnInit {
  @Output() sendLinkRequest: EventEmitter<string>;
  @Output() anonymousSigninRequest: EventEmitter<unknown>;
  @Input() invited: boolean;

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
    this.invited = false;
    this.interpreter = new Interpreter(machine(this.invited));
  }

  update(action: Actions) {
    this.interpreter.send(action);
    const isErrorState = (s: States) =>
      s.state === 'guestError' || s.state === 'emailError';
    const prev = this.interpreter.current.value.previous;
    const wasError = prev !== undefined && isErrorState(prev.state);
    const isError = isErrorState(this.state);
    if (action.event === 'chooseGuest') {
      this.emailControl.setValue('');
      this.emailForm.reset();
    }
    if (wasError && !isError) {
      this.closeErrorDialog();
    }
    if (!wasError && isError) {
      this.openErrorDialog();
    }
    if (
      action.event === 'chooseEmail' &&
      this.state.state === 'emailInProgress'
    ) {
      this.sendLinkRequest.emit(this.state.email);
    }
    if (action.event === 'resend') {
      this.sendLinkRequest.emit(this.state.email);
    }
    if (
      action.event === 'chooseGuest' &&
      this.state.state === 'guestInProgress'
    ) {
      this.anonymousSigninRequest.emit(true);
    }
  }

  get state() {
    return this.interpreter.current.value.state;
  }

  get isBusy() {
    return (
      this.state.state === 'emailInProgress' ||
      this.state.state === 'guestInProgress' ||
      this.state.state === 'resendInProgress'
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
        event: 'chooseEmail',
        email: this.emailControl.value.trim(),
      });
    }
  }

  ngOnInit(): void {
    this.interpreter = new Interpreter(machine(this.invited));
  }
}
