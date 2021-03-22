import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SignInEmailUiComponent } from '../sign-in-email-ui/sign-in-email-ui.component';

export const emailLocalStorageKey = 'emailForSignIn';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('signinui') signInUi?: SignInEmailUiComponent;
  destroyed: Subject<unknown>;

  constructor(private readonly auth: AngularFireAuth, private router: Router) {
    this.destroyed = new Subject<unknown>();
  }

  ngAfterViewInit(): void {
    if (this.signInUi === undefined) {
      throw new Error('The signInUi was not properly initialized.');
    }
    this.signInUi.sendLinkRequest
      .pipe(takeUntil(this.destroyed))
      .subscribe(async (email) => await this.sendEmailSignInLink(email));
    this.signInUi.anonymousSigninRequest
      .pipe(takeUntil(this.destroyed))
      .subscribe(async () => await this.startAnonymousSignIn());
  }

  async sendEmailSignInLink(email: string) {
    if (this.signInUi === undefined) {
      throw new Error('The signInUi was not properly initialized.');
    }
    try {
      const currentUser = await this.auth.currentUser;
      const shouldConvertAnonymousUser = currentUser?.isAnonymous === true; // TODO And check there is data to be lost
      const processEmailLinkUrl = `${
        window.location.origin
      }/signinprocessemaillink?upgrade=${shouldConvertAnonymousUser ? 1 : 0}`;
      await this.auth.sendSignInLinkToEmail(email, {
        url: processEmailLinkUrl,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(emailLocalStorageKey, email);
      this.signInUi.update({ event: 'emailSent', email });
    } catch (e) {
      if (e instanceof Error) {
        this.signInUi.update({ event: 'emailError', email, error: e.message });
      } else {
        throw e;
      }
    }
  }

  async startAnonymousSignIn() {
    if (this.signInUi === undefined) {
      throw new Error('The signInUi was not properly initialized.');
    }
    try {
      await this.auth.signOut();
      await this.auth.signInAnonymously();
      this.signInUi.update({ event: 'anonymousSuccess' });
      await this.router.navigate(['profile']);
    } catch (e) {
      if (e instanceof Error) {
        this.signInUi.update({ event: 'anonymousError', error: e.message });
      } else {
        throw e;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next(true);
  }

  ngOnInit(): void {}

  async signInAsGuest() {
    await this.auth.signOut();
    await this.auth.signInAnonymously();
    await this.router.navigate(['profile']);
  }
}
