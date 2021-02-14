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

export const appConfig = { imports: imports, providers: providers };

@NgModule({
  declarations: [AppComponent, ExperimentComponent, AuthPlaygroundComponent],
  imports: [...imports],
  providers: [...providers],
  bootstrap: [AppComponent],
})
export class AppModule {}
