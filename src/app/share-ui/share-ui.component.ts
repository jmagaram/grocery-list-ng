import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { visibleString } from '../common/utilities';

export type User = { uid: string; displayName?: string };

export type Invite =
  | { invite: 'exists'; uri: string }
  | { invite: 'creating' }
  | { invite: 'none' };

type State =
  | { state: 'loading' }
  | { state: 'unauthorized' }
  | { state: 'authorized'; userName?: string; invite: Invite };

export type Action =
  | { action: 'guestOrNotSignedIn' }
  | { action: 'authorized'; userName?: string; invite: Invite }
  | { action: 'copyInvite' }
  | { action: 'createInvite'; userName?: string }
  | { action: 'errorCreatingInvite'; error: string };

type Effect =
  | { effect: 'copyToClipboard' }
  | { effect: 'initializeForm'; userName?: string }
  | { effect: 'createInvite'; userName?: string }
  | { effect: 'displayError'; message: string };

type Machine = {
  initial: State;
  transition: (
    source: State,
    event: Action
  ) => { target?: State; effects?: Effect[] } | undefined;
};

@Component({
  selector: 'app-share-ui',
  templateUrl: './share-ui.component.html',
  styleUrls: ['./share-ui.component.scss'],
})
export class ShareUiComponent {
  // TODO Fix weird type signature here and elsewhere
  @Output() createInvite = new EventEmitter<{ userName?: string }>();
  readonly inviteInputId = 'inviteInput';
  state: State;
  machine: Machine;
  displayNameControl: FormControl;
  createInviteForm: FormGroup;

  constructor(
    private readonly snackbar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.displayNameControl = new FormControl('', [Validators.required]);
    this.createInviteForm = new FormGroup({
      displayName: this.displayNameControl,
    });
    this.machine = {
      initial: { state: 'loading' },
      transition: (s, e) => {
        switch (s.state) {
          case 'unauthorized':
          case 'loading':
          case 'authorized':
            switch (e.action) {
              case 'authorized':
                return {
                  target: {
                    state: 'authorized',
                    invite: e.invite,
                    userName: visibleString(e.userName),
                  },
                  effects: [
                    {
                      effect: 'initializeForm',
                      userName: e.userName,
                    },
                  ],
                };
              case 'guestOrNotSignedIn':
                return { target: { state: 'unauthorized' } };
            }
        }
        switch (s.state) {
          case 'authorized':
            switch (e.action) {
              case 'copyInvite':
                return s.invite.invite === 'exists'
                  ? { effects: [{ effect: 'copyToClipboard' }] }
                  : undefined;
              case 'createInvite':
                return s.invite.invite === 'none'
                  ? {
                      target: { ...s, invite: { invite: 'creating' } },
                      effects: [
                        {
                          effect: 'createInvite',
                          userName: e.userName,
                        },
                      ],
                    }
                  : undefined;
              case 'errorCreatingInvite':
                return s.invite.invite === 'creating'
                  ? {
                      target: { ...s, invite: { invite: 'none' } },
                      effects: [{ effect: 'displayError', message: e.error }],
                    }
                  : undefined;
            }
        }
        return undefined;
      },
    };
    this.state = this.machine.initial;
  }

  submitForm() {
    if (this.createInviteForm.valid) {
      this.send({
        action: 'createInvite',
        userName: this.displayNameControl.value,
      });
    }
  }

  send(action: Action) {
    const result = this.machine.transition(this.state, action);
    if (result !== undefined) {
      this.state = result.target ?? this.state;
      result.effects?.forEach((e) => {
        switch (e.effect) {
          case 'initializeForm':
            this.createInviteForm.reset();
            this.displayNameControl.setValue(e.userName ?? '');
            break;
          case 'displayError':
            this.snackbar.open(e.message, 'DISMISS');
            break;
          case 'copyToClipboard':
            const element = this.document.querySelector<HTMLInputElement>(
              `#${this.inviteInputId}`
            );
            if (element) {
              element.select();
              document.execCommand('copy');
              this.snackbar.open('Copied!', 'DISMISS', { duration: 4000 });
            } else {
              // TODO Handle unexpected error.
            }
            break;
          case 'createInvite':
            try {
              this.createInvite.next({
                userName: visibleString(this.displayNameControl.value),
              });
            } catch (error: unknown) {
              this.send({
                action: 'errorCreatingInvite',
                error:
                  error instanceof Error
                    ? error.message
                    : 'Could not create the invitation.', // TODO Handle error
              });
            }
            break;
        }
      });
    }
  }
}
