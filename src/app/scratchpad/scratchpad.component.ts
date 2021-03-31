import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SignInEmailUiComponent } from '../sign-in-email-ui/sign-in-email-ui.component';

@Component({
  selector: 'app-scratchpad',
  templateUrl: './scratchpad.component.html',
  styleUrls: ['./scratchpad.component.scss'],
})
export class ScratchpadComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('signin') signInControl?: SignInEmailUiComponent;
  destroyed: Subject<unknown>;

  constructor() {
    this.destroyed = new Subject<unknown>();
  }

  async wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  ngAfterViewInit(): void {
    const sc = this.signInControl;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // this.signInControl!.reportProgress({ kind: 'sending' });
    const makeSignInSucceed = true;
    const signInDelay = 3000;
    if (sc) {
      sc.sendLinkRequest
        .pipe(takeUntil(this.destroyed))
        .subscribe(async (i) => {
          await this.wait(signInDelay);
          if (makeSignInSucceed) {
            sc.update({ event: 'emailSuccess' });
          } else {
            sc.update({
              event: 'emailError',
              error:
                'Could not connect to the network. Check all your cables and have some ice cream while you are at it. ',
            });
          }
        });
      sc.anonymousSigninRequest
        .pipe(takeUntil(this.destroyed))
        .subscribe(async (i) => {
          await this.wait(signInDelay);
          if (makeSignInSucceed) {
            sc.update({ event: 'guestSuccess' });
          } else {
            sc.update({
              event: 'guestError',
              error: 'Weird anonymous sign-in error.',
            });
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next(true);
  }

  ngOnInit(): void {}
}
