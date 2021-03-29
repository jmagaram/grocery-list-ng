/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ManageInvitationService } from './manage-invitation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type User = { uid: string; displayName?: string };

type Invite =
  | { invite: 'exists'; uri: string }
  | { invite: 'creating' }
  | { invite: 'none' };

type State =
  | { state: 'loading' }
  | { state: 'unauthorized' }
  | { state: 'authorized'; user: User; invite: Invite };

type Action =
  | { action: 'guestOrNotSignedIn' }
  | { action: 'authorized'; user: User; invite: Invite }
  | { action: 'copyInvite' }
  | { action: 'createInvite'; userDisplayName: string }
  | { action: 'errorCreatingInvite'; error: string };

type Effect =
  | { effect: 'copyToClipboard' }
  | { effect: 'initializeForm'; user: User }
  | { effect: 'createInvite'; user: User }
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
export class ShareUiComponent implements OnInit, OnDestroy {
  readonly inviteInputId = 'inviteInput';
  state: State;
  machine: Machine;
  displayNameControl: FormControl;
  createInviteForm: FormGroup;
  destroyed: Subject<unknown>;

  constructor(
    private readonly snackbar: MatSnackBar,
    private readonly svc: ManageInvitationService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.destroyed = new Subject<unknown>();
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
                    user: e.user,
                  },
                  effects:
                    s.state === 'authorized' && s.invite.invite === 'none'
                      ? [{ effect: 'initializeForm', user: s.user }]
                      : [],
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
                          user: { ...s.user, displayName: e.userDisplayName },
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

  ngOnDestroy(): void {
    this.destroyed.next(true);
  }

  ngOnInit() {
    this.svc.invitation$
      .pipe(takeUntil(this.destroyed))
      .subscribe(async (i) => {
        switch (i.state) {
          case 'guest':
          case 'notSignedIn':
            await this.send({ action: 'guestOrNotSignedIn' });
            break;
          case 'authorized':
            await this.send({
              action: 'authorized',
              invite: i.inviteUri
                ? { invite: 'exists', uri: i.inviteUri }
                : { invite: 'none' },
              user: i.user,
            });
        }
      });
  }

  async submitForm() {
    if (this.createInviteForm.valid) {
      await this.send({
        action: 'createInvite',
        userDisplayName: this.displayNameControl.value,
      });
    }
  }

  async send(action: Action) {
    const result = this.machine.transition(this.state, action);
    if (result !== undefined) {
      this.state = result.target ?? this.state;
      for (const e of result.effects ?? []) {
        switch (e.effect) {
          case 'initializeForm':
            this.displayNameControl.setValue(e.user.displayName ?? '');
            break;
          case 'displayError':
            // TODO Standardize display style of snackbar messages
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
              // TODO Handle this unexpected error.
            }
            break;
          case 'createInvite':
            try {
              await this.svc.createInvitation({
                uid: e.user.uid,
                displayName: this.displayNameControl.value,
              });
            } catch (error: unknown) {
              await this.send({
                action: 'errorCreatingInvite',
                error:
                  error instanceof Error
                    ? error.message
                    : 'Could not create the invitation.', // TODO Handle this
              });
            }
            break;
        }
      }
    }
  }
}
