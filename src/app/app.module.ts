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
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthPlaygroundComponent } from './auth-playground/auth-playground.component';
import { GroceryListComponent } from './grocery-list/grocery-list.component';
import { CommonModule } from '@angular/common'; // TODO Check if really needed
import { SignInComponent } from './sign-in/sign-in.component';
import { SignInProcessEmailLinkComponent } from './sign-in-process-email-link/sign-in-process-email-link.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileComponent } from './profile/profile.component';

const imports = [
  BrowserModule,
  AppRoutingModule,
  AngularFirestoreModule,
  AngularFireModule.initializeApp(environment.firebaseConfig),
  AngularFireAuthModule,
  ReactiveFormsModule,
  BrowserAnimationsModule,
  MatButtonModule,
  MatInputModule,
  MatTabsModule,
  MatRadioModule,
  MatIconModule,
  MatProgressSpinnerModule,
  FlexLayoutModule,
  CommonModule,
  MatStepperModule,
  MatToolbarModule,
  MatDividerModule,
];

// Do not understand why the port numbers are duplicated here and in the
// firebase.json file.
// https://tinyurl.com/y4d4o2yk
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

const providers = [emulatorProviders];

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
  ],
  imports: [...imports],
  providers: [...providers],
  bootstrap: [AppComponent],
})
export class AppModule {}
