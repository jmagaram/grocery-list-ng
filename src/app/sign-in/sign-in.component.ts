import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  constructor(private readonly auth: AngularFireAuth) {
    // auth.sign
    // const ui = new firebaseUi.auth.AuthUI(firebase.default.auth());
    // ui.
  }

  ngOnInit(): void {}
}
