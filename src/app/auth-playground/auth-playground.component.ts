import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth-playground',
  templateUrl: './auth-playground.component.html',
  styleUrls: ['./auth-playground.component.scss'],
})
export class AuthPlaygroundComponent implements OnInit {
  constructor(public auth: AngularFireAuth) {
    this.user$ = auth.user;
  }

  user$: Observable<firebase.User | null>;

  ngOnInit(): void {}
  login() {
    const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(googleAuthProvider);

    // const emailAuthProvider = new firebase.auth.EmailAuthProvider();
    // this.auth.createUserWithEmailAndPassword("amy@magaram.com","testing");
    // this.auth.signInWithEmailAndPassword('amy@magaram.com', 'testing');
  }

  logout() {
    this.auth.signOut();
  }
}
