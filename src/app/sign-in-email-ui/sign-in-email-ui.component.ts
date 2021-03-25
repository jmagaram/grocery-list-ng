import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  Input,
} from '@angular/core';
import { trigger } from '@angular/animations';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Interpreter, Machine } from '../common/machine';
import { leftPanel, rightPanel } from '../common/animations';

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
  animations: [
    trigger('leftPanel', leftPanel),
    trigger('rightPanel', rightPanel),
  ],
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
  interpreter?: Interpreter<States, Actions, States['state'], Actions['event']>;
  machine?: Machine<States, Actions>;

  constructor(private dialogService: MatDialog) {
    this.emailControl = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);
    this.emailForm = new FormGroup({ email: this.emailControl });
    this.sendLinkRequest = new EventEmitter<string>();
    this.anonymousSigninRequest = new EventEmitter<unknown>();
    this.invited = false;
  }

  update(action: Actions) {
    this.interpreter?.send(action);
  }

  get state() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.interpreter!.current.value.state;
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

  // TODO Using standard library function for distinct until changed deep equal
  ngOnInit(): void {
    this.machine = {
      initial: {
        state: 'chooseEmailOrGuest',
        invited: this.invited,
        email: '',
        sentTo: new Set<string>(),
      },
      states: {
        chooseEmailOrGuest: {
          on: {
            chooseEmail: (s, e) => ({
              ...s,
              email: e.email,
              state: s.sentTo.has(e.email) ? 'emailSuccess' : 'emailInProgress',
            }),
            chooseGuest: (s, e) =>
              !s.invited
                ? { ...s, email: '', state: 'guestInProgress' }
                : undefined,
          },
        },
        guestInProgress: {
          on: {
            guestError: (s, e) => ({
              ...s,
              state: 'guestError',
              error: e.error,
            }),
            guestSuccess: (s, e) => ({ ...s, state: 'guestSuccess' }),
          },
          enter: (s) => {
            this.emailControl.setValue(s.email);
            this.anonymousSigninRequest.emit(true);
          },
        },
        guestError: {
          on: {
            dismissError: (s, e) => ({ ...s, state: 'chooseEmailOrGuest' }),
          },
          enter: (s) => this.openErrorDialog(),
          exit: (s) => this.closeErrorDialog(),
        },
        emailInProgress: {
          on: {
            emailError: (s, e) => ({
              ...s,
              state: 'emailError',
              error: e.error,
            }),
            emailSuccess: (s, e) => ({
              ...s,
              state: 'emailSuccess',
              sentTo: s.sentTo.add(s.email),
            }),
          },
          enter: (s) => {
            this.sendLinkRequest.emit(s.email);
          },
        },
        emailError: {
          on: {
            dismissError: (s, e) => ({ ...s, state: 'chooseEmailOrGuest' }),
          },
          enter: (s) => this.openErrorDialog(),
          exit: (s) => this.closeErrorDialog(),
        },
        emailSuccess: {
          on: {
            startOver: (s, e) => ({ ...s, state: 'chooseEmailOrGuest' }),
            resend: (s, e) => ({ ...s, state: 'resendInProgress' }),
          },
        },
        resendInProgress: {
          on: {
            emailError: (s, e) => ({
              ...s,
              state: 'resendError',
              error: e.error,
            }),
            emailSuccess: (s, e) => ({ ...s, state: 'emailSuccess' }),
          },
          enter: (s) => {
            this.sendLinkRequest.emit(s.email);
          },
        },
        resendError: {
          on: {
            dismissError: (s, e) => ({ ...s, state: 'emailSuccess' }),
          },
          enter: (s) => this.openErrorDialog(),
          exit: (s) => this.closeErrorDialog(),
        },
      },
    };
    this.interpreter = new Interpreter(this.machine);
  }
}
