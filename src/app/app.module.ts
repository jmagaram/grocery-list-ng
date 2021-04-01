import { NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { environment } from './../environments/environment';
import { AngularFireModule } from '@angular/fire';
import {
  AngularFirestoreModule,
  SETTINGS,
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
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthPlaygroundComponent } from './auth-playground/auth-playground.component';
import { GroceryListComponent } from './grocery-list/grocery-list.component';
import { CommonModule } from '@angular/common'; // TODO Check if really needed
import { SignInComponent } from './sign-in/sign-in.component';
import { SignInProcessEmailLinkComponent } from './sign-in-process-email-link/sign-in-process-email-link.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileComponent } from './profile/profile.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScratchpadComponent } from './scratchpad/scratchpad.component';
import { SignInEmailUiComponent } from './sign-in-email-ui/sign-in-email-ui.component';
import { ShareUiComponent } from './share-ui/share-ui.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ShareUiTryComponent } from './share-ui-try/share-ui-try.component';
import { MembersComponent } from './members/members.component';
import { EmulatorUtilityComponent } from './emulator-utility/emulator-utility.component';

const imports = [
  BrowserModule,
  AppRoutingModule,
  AngularFirestoreModule,
  AngularFireModule.initializeApp(environment.firebaseConfig),
  AngularFireAuthModule,
  ReactiveFormsModule,
  FormsModule, // TODO Might only need this in testing
  BrowserAnimationsModule,
  MatButtonModule,
  MatInputModule,
  MatTabsModule,
  MatRadioModule,
  MatIconModule,
  FlexLayoutModule,
  CommonModule,
  MatStepperModule,
  MatToolbarModule,
  MatDividerModule,
  MatDialogModule,
  MatProgressBarModule,
  MatSnackBarModule,
];

// Do not understand why the port numbers are duplicated here and in the
// firebase.json file.
// https://tinyurl.com/y4d4o2yk
const emulatorProviders: Provider[] = environment.useEmulators
  ? [
      { provide: USE_AUTH_EMULATOR, useValue: ['localhost', 9099] },
      { provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080] },
    ]
  : [];

const providers = [
  emulatorProviders,
  { provide: SETTINGS, useValue: { ignoreUndefinedProperties: true } },
];

export const appConfig = { imports, providers };

@NgModule({
  declarations: [
    AppComponent,
    ExperimentComponent,
    AuthPlaygroundComponent,
    GroceryListComponent,
    SignInComponent,
    SignInProcessEmailLinkComponent,
    ProfileComponent,
    SignInEmailUiComponent,
    ScratchpadComponent,
    ShareUiComponent,
    ShareUiTryComponent,
    MembersComponent,
    EmulatorUtilityComponent,
  ],
  imports: [...imports],
  providers: [...providers],
  bootstrap: [AppComponent],
})
export class AppModule {}
