import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

export type User =
  | { kind: 'anonymous'; uid: string }
  | {
      kind: 'registered';
      uid: string;
      name?: string;
      email: string;
    };

// TODO Remove this code from production builds
// TODO Determine if this could work against real firebase server; don't want an accident
@Injectable({
  providedIn: 'root',
})
export class EmulatorUtilityService {
  readonly password = 'password';
  constructor(readonly auth: AngularFireAuth) {}

  // https://firebase.google.com/docs/reference/rest/auth#section-auth-emulator-clearaccounts
  // See .firebaserc for projectId
  async deleteAllUserAccounts(projectId: string) {
    const uri = `http://localhost:9099/emulator/v1/projects/${projectId}/accounts`;
    await fetch(uri, { method: 'DELETE' });
  }

  async createEmailPasswordUser(
    email: string,
    name?: string
  ): Promise<User & { kind: 'registered' }> {
    await this.auth.signOut();
    const cred = await this.auth.createUserWithEmailAndPassword(
      email,
      this.password
    );
    if (cred.user === null) {
      throw new Error('Could not create the user account.');
    }
    if (cred.user.email === null) {
      throw new Error('Could not initialize the email address.');
    }
    if (name !== undefined) {
      await cred.user.updateProfile({ displayName: name });
      if (cred.user.displayName !== null && cred.user.displayName !== name) {
        throw new Error('Could not initialize the display name.');
      }
    }
    return {
      kind: 'registered',
      uid: cred.user.uid,
      name: name === undefined ? undefined : cred.user.displayName ?? undefined,
      email: cred.user.email,
    };
  }

  async signIn(email: string) {
    await this.auth.signOut();
    const cred = await this.auth.signInWithEmailAndPassword(
      email,
      this.password
    );
    if (cred.user === null) {
      throw new Error('Sign in failed.');
    }
  }

  async signInAnonymous(): Promise<User & { kind: 'anonymous' }> {
    await this.auth.signOut();
    const cred = await this.auth.signInAnonymously();
    if (cred.user === null) {
      throw new Error('Could not create the user account.');
    }
    return { kind: 'anonymous', uid: cred.user.uid };
  }

  signOut = async () => await this.auth.signOut();
}
