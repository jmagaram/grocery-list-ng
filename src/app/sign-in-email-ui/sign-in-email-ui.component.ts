import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  takeUntil,
} from 'rxjs/operators';
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
        !s.invited ? { ...s, email: '', state: 'guestInProgress' } : undefined,
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
export class SignInEmailUiComponent implements OnInit, OnDestroy {
  @Output() sendLinkRequest: EventEmitter<string>;
  @Output() anonymousSigninRequest: EventEmitter<unknown>;
  @Input() invited: boolean;
  @ViewChild('errordialog')
  errorDialogTemplate?: TemplateRef<any>;
  errorDialogRef?: MatDialogRef<any, any>;
  emailControl: FormControl;
  emailForm: FormGroup;
  interpreter: Interpreter<States, Actions, States['state'], Actions['event']>;
  destroyed: Subject<unknown>;

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
    this.destroyed = new Subject<unknown>();
  }
  ngOnDestroy(): void {
    this.destroyed.next(true);
  }

  update(action: Actions) {
    this.interpreter.send(action);
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

  // TODO Using standard library function for distinct until changed deep equal
  ngOnInit(): void {
    this.interpreter = new Interpreter(machine(this.invited));

    this.interpreter.current
      .pipe(
        map(
          (i) =>
            i.state.state === 'guestError' ||
            i.state.state === 'resendError' ||
            i.state.state === 'emailError'
        ),
        pairwise(),
        filter((i) => i[0] !== i[1])
      )
      .subscribe((i) => {
        if (i[1]) {
          this.openErrorDialog();
        } else {
          this.closeErrorDialog();
        }
      });

    this.interpreter.current
      .pipe(
        map((i) => i.state),
        pairwise(),
        filter(
          (i) =>
            i[0].state !== 'guestInProgress' && i[1].state === 'guestInProgress'
        ),
        map((i) => i[1])
      )
      .subscribe((i) => {
        this.emailControl.setValue(i.email);
        this.anonymousSigninRequest.emit(true);
      });

    const isEmailInProgress = (s: States) =>
      s.state === 'emailInProgress' || s.state === 'resendInProgress';
    this.interpreter.current
      .pipe(
        map((i) => i.state),
        pairwise(),
        filter((i) => !isEmailInProgress(i[0]) && isEmailInProgress(i[1])),
        map((i) => i[1].email)
      )
      .subscribe((email) => this.sendLinkRequest.emit(email));
  }
}
