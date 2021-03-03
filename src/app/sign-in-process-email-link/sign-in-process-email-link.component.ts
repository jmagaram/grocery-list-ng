import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { emailLocalStorageKey } from '../sign-in/sign-in.component';
import firebase from 'firebase';

@Component({
  selector: 'app-sign-in-process-email-link',
  templateUrl: './sign-in-process-email-link.component.html',
  styleUrls: ['./sign-in-process-email-link.component.scss'],
})
// Based on https://firebase.google.com/docs/auth/web/email-link-auth?authuser=0
export class SignInProcessEmailLinkComponent implements OnInit, OnDestroy {
  emailControl: FormControl;
  emailFormGroup: FormGroup;
  errorMessage?: string;
  sub: Subscription;
  recommendOpeningLinkInOtherBrowser: boolean;
  constructor(
    private readonly auth: AngularFireAuth,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.recommendOpeningLinkInOtherBrowser = false;
    this.emailControl = new FormControl('', [
      Validators.email,
      Validators.required,
    ]);
    this.emailFormGroup = new FormGroup({ email: this.emailControl });
    this.sub = this.emailControl.valueChanges.subscribe(
      (_) => (this.errorMessage = undefined)
    );
    if (auth.isSignInWithEmailLink(window.location.href)) {
      const isUpgradeDesirable =
        activatedRoute.snapshot.queryParamMap.get('upgrade') === '1';
      const email = window.localStorage.getItem(emailLocalStorageKey);
      if (email !== null) {
        this.emailControl.setValue(email);
      }
      const recommendOpeningLinkInOtherBrowser =
        isUpgradeDesirable && email === null;
      if (recommendOpeningLinkInOtherBrowser) {
        this.errorMessage =
          `It looks like you started the sign-in process on a different ` +
          `phone or computer, or while using a different web browser. That's fine ` +
          `but be aware you'll lose any information you typed into your grocery list. ` +
          `If you'd like to keep that information, copy the link from the email into the other ` +
          `web browser instead.`;
      }
    } else {
      this.errorMessage = 'Not sure how you ended up on this page.';
    }
  }

  async submitEmail() {
    if (this.emailFormGroup.valid) {
      const currentUser = await this.auth.currentUser;
      if (currentUser !== null) {
        const credential = firebase.auth.EmailAuthProvider.credentialWithLink(
          this.emailControl.value,
          window.location.href
        );
        await currentUser.linkWithCredential(credential);
      } else {
        await this.auth.signInWithEmailLink(this.emailControl.value);
      }
      window.localStorage.removeItem(emailLocalStorageKey);
      await this.router.navigate(['profile']);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit(): void {}
}
