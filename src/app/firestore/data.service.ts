import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Animal, ExcludeId, Invitation, Replace } from './data-types';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { mapString, visibleString } from '../common/utilities';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of as obsOf } from 'rxjs';
import { invitationPassword } from './data-functions';

export enum Collections {
  animals = 'animal',
  invitations = 'invitation',
  groceryList = 'grocerylist',
}

type FieldValue = firebase.firestore.FieldValue;

const serverTimestamp = (): FieldValue =>
  firebase.firestore.FieldValue.serverTimestamp();

type User =
  | { auth: 'notAuthenticated' }
  | { auth: 'anonymous'; uid: string }
  | {
      auth: 'registered';
      uid: string;
      name?: string;
      email?: { address: string; verified: boolean };
    };

export type OwnedInvitations =
  | { auth: 'notAuthenticated' }
  | { auth: 'anonymous' }
  | {
      auth: 'registered';
      name?: string;
      invitations: { password: string; createdOn: Date }[];
    };

@Injectable({
  providedIn: 'root',
})
export class AuthQueriesService {
  constructor(private readonly auth: AngularFireAuth) {}

  convertFirebaseUser = (user: firebase.User | null): User => {
    if (user === null) {
      return { auth: 'notAuthenticated' };
    } else if (user.isAnonymous) {
      return { auth: 'anonymous', uid: user.uid };
    } else {
      const address = mapString(user.email, (i) => i, undefined);
      const email =
        address === undefined
          ? undefined
          : { address, verified: user.emailVerified };
      return {
        auth: 'registered',
        uid: user.uid,
        name: mapString(user.displayName, (i) => i, undefined),
        email,
      };
    }
  };

  currentUser = (): Observable<User> =>
    this.auth.user.pipe(map(this.convertFirebaseUser));
}

// TODO Consider first writing a bunch of functions and then wrap them in
// services

@Injectable({
  providedIn: 'root',
})
export class DataQueriesService {
  constructor(
    readonly fs: AngularFirestore,
    readonly auth: AuthQueriesService
  ) {}

  allAnimals = () =>
    this.fs
      .collection<Animal>(Collections.animals)
      .valueChanges({ idField: 'id' });

  // TODO This is not working reliably
  ownedInvitations = (): Observable<OwnedInvitations> => {
    const notAuthenticated: OwnedInvitations = { auth: 'notAuthenticated' };

    const anonymous: OwnedInvitations = { auth: 'anonymous' };

    const registered = (
      user: User & { auth: 'registered' },
      inv: Invitation[]
    ): OwnedInvitations => ({
      auth: 'registered',
      name: user.name,
      invitations: inv.map((i) => ({
        password: i.id,
        createdOn: (i.createdOn as any).toDate(), // TODO Hack
      })),
    });

    return this.auth.currentUser().pipe(
      switchMap((user) => {
        switch (user.auth) {
          case 'anonymous':
            return obsOf(anonymous);
          case 'notAuthenticated':
            return obsOf(notAuthenticated);
          case 'registered':
            return this.fs
              .collection<Invitation>(Collections.invitations, (ref) =>
                ref.where('owner', '==', user.uid)
              )
              .valueChanges({ idField: 'id' })
              .pipe(map((inv) => registered(user, inv)));
        }
      })
    );
  };
}

@Injectable({
  providedIn: 'root',
})
export class DataCommandsService {
  constructor(
    private readonly fs: AngularFirestore,
    private readonly auth: AngularFireAuth
  ) {}

  createAnimal = async (animal: ExcludeId<Animal>) => {
    await this.fs
      .collection<Omit<Animal, 'id'>>(Collections.animals)
      .add(animal);
  };

  /**
   * Creates an invitation to share a grocery list.
   *
   * @param userName - If provided, updates the current user's profile display
   * name so when someone views the invitation they can see the name of the
   * person who invited them.
   */
  createInvitation = async (userName?: string) => {
    const user = await this.auth.currentUser;
    if (user === null) {
      throw new Error('You need to be signed in to create an invitation.');
    }
    if (userName !== undefined) {
      await user.updateProfile({
        displayName: userName, // TODO Does this change the photo URL?
      });
      await user.getIdToken(true);
    }
    type Doc = ExcludeId<Replace<Invitation, 'createdOn', FieldValue>>;
    const password = invitationPassword();
    const inv: Doc = {
      version: '1',
      createdOn: serverTimestamp(),
      owner: user.uid,
    };
    await this.fs
      .collection<Doc>(Collections.invitations)
      .doc(password)
      .set(inv);
  };
}
