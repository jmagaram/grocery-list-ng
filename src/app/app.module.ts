import { NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { environment } from './../environments/environment';

import { AngularFireModule } from '@angular/fire';
import {
  AngularFirestoreModule,
  USE_EMULATOR as USE_FIRESTORE_EMULATOR,
} from '@angular/fire/firestore';
import {
  AngularFireAuthModule,
  USE_EMULATOR as USE_AUTH_EMULATOR,
} from '@angular/fire/auth';

import { AppComponent } from './app.component';
import { ExperimentComponent } from './experiment/experiment.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AuthPlaygroundComponent } from './auth-playground/auth-playground.component';

const firebaseUiConfig = {
  enableFirestoreSync: true, // enable/disable autosync users with firestore
  toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
  toastMessageOnAuthError: false, // whether to open/show a snackbar message on auth error - default : true
  authGuardFallbackURL: '/loggedout', // url for unauthenticated users - to use in combination with canActivate feature on a route
  authGuardLoggedInURL: '/loggedin', // url for authenticated users - to use in combination with canActivate feature on a route
  passwordMaxLength: 60, // `min/max` input parameters in components should be within this range.
  passwordMinLength: 8, // Password length min/max in forms independently of each componenet min/max.
  nameMaxLength: 50, // Same as password but for the name
  nameMinLength: 2, // Same as password but for the name
  // If set, sign-in/up form is not available until email has been verified.
  // Plus protected routes are still protected even though user is connected.
  guardProtectedRoutesUntilEmailIsVerified: true,
  enableEmailVerification: true, // default: true
  useRawUserCredential: true, // If set to true outputs the UserCredential object instead of firebase.User after login and signup - Default: false
};

// https://github.com/angular/angularfire/blob/master/docs/emulators/emulators.md
// Do not understand why the port numbers are duplicated here and in the firebase.json file.
const emulatorProviders: Provider[] = environment.useEmulators
  ? [
      {
        provide: USE_AUTH_EMULATOR,
        useValue: ['localhost', 9099],
      },
      {
        provide: USE_FIRESTORE_EMULATOR,
        useValue: ['localhost', 8080],
      },
    ]
  : [];

@NgModule({
  declarations: [AppComponent, ExperimentComponent, AuthPlaygroundComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
  ],
  providers: [...emulatorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}
