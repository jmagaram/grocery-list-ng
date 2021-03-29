import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of as obsOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { invitationCollection, Invitation } from '../firestore/data-types';
import { createInvitation } from '../firestore/data-functions';
import firebase from 'firebase/app';

type InvitationState =
  | { state: 'guest' }
  | { state: 'notSignedIn' }
  | {
      state: 'authorized';
      user: { uid: string; displayName?: string };
      inviteUri?: string;
    };

export interface ManageInvitation {
  readonly invitation$: Observable<InvitationState>;
  createInvitation(user: { uid: string; displayName: string }): Promise<void>;
}

@Injectable({
  providedIn: 'root', // TODO Should this be at the root level?
})
export class ManageInvitationService implements ManageInvitation {
  invitation$: Observable<InvitationState>;
  constructor(
    private readonly auth: AngularFireAuth,
    private readonly fs: AngularFirestore
  ) {
    // TODO Use fp-ts and fs-ts-std, Option
    // TODO Learn if rxjs can have undefined as a value; using null for now
    const mostRecent = (items: Invitation<'read'>[]) =>
      items.reduce<Invitation<'read'> | undefined>(
        (total, i) =>
          total === undefined ? i : i.createdOn > total.createdOn ? i : total,
        undefined
      );

    // TODO Determine why the invitation has undefined ID
    const invitationAsUri = (invite: Invitation<'read'>) =>
      `http://ourgrocerylist.app/share/${invite.password}`;

    const mostRecentInvitation = (uid: string) =>
      this.fs
        .collection<Invitation<'read'>>(invitationCollection, (ref) =>
          ref.where('owner.uid', '==', uid)
        )
        .valueChanges()
        .pipe(
          map((i) => {
            const m = mostRecent(i);
            if (m !== undefined) {
              return invitationAsUri(m);
            } else {
              return null;
            }
          })
        );

    this.invitation$ = this.auth.user.pipe(
      switchMap((u) =>
        u === null
          ? obsOf({ state: 'notSignedIn' } as InvitationState)
          : u.isAnonymous
          ? obsOf({ state: 'guest' } as InvitationState)
          : mostRecentInvitation(u.uid).pipe(
              map(
                (inviteUri) =>
                  ({
                    state: 'authorized',
                    user: {
                      uid: u.uid,
                      displayName: u.displayName ?? undefined,
                    },
                    inviteUri,
                  } as InvitationState)
              )
            )
      )
    );
  }

  async createInvitation(user: {
    uid: string;
    displayName: string; // TODO Replace or update? Trimmed?
  }): Promise<void> {
    const currentUser = await this.auth.currentUser;
    if (!currentUser || currentUser.isAnonymous) {
      // TODO Allow security rules to catch this?
      throw new Error(
        'Only signed-in registered users can create invitations.'
      );
    } else {
      if (
        currentUser.displayName === null &&
        user.displayName !== currentUser.displayName
      ) {
        // TODO What if user.uid is not current user?
        // TODO Refresh token?
        await currentUser.updateProfile({ displayName: user.displayName });
        await currentUser.getIdToken(true); // Required so display name matches invite name and passes security rules
      }
      const invite = createInvitation(
        {
          uid: currentUser.uid,
          name: currentUser.displayName ?? undefined, // TODO Require display name?
          email:
            currentUser.email !== null
              ? {
                  address: currentUser.email,
                  verified: currentUser.emailVerified,
                }
              : undefined,
        },
        firebase.firestore.FieldValue.serverTimestamp()
      );
      await this.fs
        .collection<Invitation<'create'>>(invitationCollection)
        .doc()
        .set(invite);
    }
  }
}
