import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';
import { filterMap, mapString } from '../common/utilities';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user$: Observable<firebase.User | null>;

  constructor(private readonly auth: AngularFireAuth, private router: Router) {
    this.user$ = auth.user.pipe(shareReplay(1));
  }

  async signOut() {
    await this.auth.signOut();
    await this.router.navigate(['signin']);
  }

  async signOutAndDelete() {
    const user = await this.auth.currentUser;
    if (user !== null) {
      await user.delete();
      await this.auth.signOut();
    }
    await this.router.navigate(['signin']);
  }

  async signIn() {
    await this.router.navigate(['signin']);
  }

  stringOr = (s: string | undefined | null, otherwise: string) =>
    mapString(s, (i) => i, otherwise);

  isAnonymous = (u: firebase.User | null | undefined) =>
    u?.isAnonymous ?? false;

  isSignedIn = (u: firebase.User | null | undefined) =>
    u !== null && u !== undefined;

  isRegisteredUser = (u: firebase.User | null | undefined) =>
    mapString(u?.email, (_) => true, false);

  async deleteAccount() {
    const user = await this.auth.currentUser;
    await user?.delete();
  }

  ngOnInit(): void {}
}
