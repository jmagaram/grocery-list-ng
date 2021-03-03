import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

export const emailLocalStorageKey = 'emailForSignIn';

enum Mode {
  chooseSignInMethod,
  sendingEmailLink,
  checkYourEmail,
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit, OnDestroy {
  emailControl: FormControl;
  chooseSignInFormGroup: FormGroup;
  errorMessage?: string;
  mode: Mode;
  sub: Subscription;

  constructor(private readonly auth: AngularFireAuth, private router: Router) {
    this.mode = Mode.chooseSignInMethod;
    this.errorMessage = undefined;
    this.emailControl = new FormControl('', [
      Validators.email,
      Validators.required,
    ]);
    this.chooseSignInFormGroup = new FormGroup({ email: this.emailControl });
    this.sub = this.emailControl.valueChanges.subscribe(
      (_) => (this.errorMessage = '')
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  isChooseSignInMethod = () => this.mode === Mode.chooseSignInMethod;
  isCheckYourEmail = () => this.mode === Mode.checkYourEmail;
  isSendingLink = () => this.mode === Mode.sendingEmailLink;

  ngOnInit(): void {}

  async signInAsGuest() {
    await this.auth.signOut();
    await this.auth.signInAnonymously();
    await this.router.navigate(['profile']);
  }

  async signInWithEmailLink() {
    if (this.chooseSignInFormGroup.valid) {
      this.mode = Mode.sendingEmailLink;
      try {
        const currentUser = await this.auth.currentUser;
        const shouldConvertAnonymousUserAccount =
          currentUser?.isAnonymous === true; // TODO And check there is data to be lost
        const processEmailLinkUrl = `${
          window.location.origin
        }/signinprocessemaillink?upgrade=${
          shouldConvertAnonymousUserAccount ? 1 : 0
        }`;
        await this.auth.sendSignInLinkToEmail(this.emailControl.value, {
          url: processEmailLinkUrl,
          handleCodeInApp: true,
        });
        this.mode = Mode.checkYourEmail;
        window.localStorage.setItem(
          emailLocalStorageKey,
          this.emailControl.value
        );
      } catch (error) {
        this.errorMessage = error.message;
        this.mode = Mode.chooseSignInMethod;
      }
    }
  }

  startOver() {
    this.mode = Mode.chooseSignInMethod;
  }
}
