import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, pipe } from 'rxjs';
import firebase from 'firebase';
import { map, publish, shareReplay, refCount } from 'rxjs/operators';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  user$: Observable<firebase.User | null>;
  userName$: Observable<string | undefined>;
  errorMessage = '';

  constructor(private readonly auth: AngularFireAuth) {
    this.user$ = auth.user.pipe(publish(), refCount());
    this.userName$ = this.user$.pipe(map((i) => this.userName(i)));
  }

  async signOut() {
    try {
      await this.auth.signOut();
    } catch (e) {
      this.errorMessage = e.message;
    }
  }

  userName = (user: firebase.User | null) => {
    const displayName = user?.displayName?.trim();
    const email = user?.email?.trim();
    return displayName !== '' && email !== ''
      ? `${displayName} (${email})`
      : displayName !== ''
      ? displayName
      : email !== ''
      ? email
      : undefined;
  };

  async signInAnonymously() {
    try {
      const credential = await this.auth.signInAnonymously();
    } catch (e) {
      this.errorMessage = e.message;
    }
  }

  async signIn(email: string, password: string) {
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async createUserAccount(email: string, password: string) {
    // no, link it
    await this.auth.createUserWithEmailAndPassword(email, password);
  }

  ngOnInit(): void {}
}
