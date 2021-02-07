import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExperimentComponent } from './experiment/experiment.component';

// https://firebase.google.com/docs/web/setup?authuser=0#using-module-bundlers
import firebase from 'firebase/app'; // Required, must be first
import 'firebase/analytics';
import 'firebase/firestore';
import { environment } from './../environments/environment';
firebase.initializeApp(environment.firebaseConfig);

@NgModule({
  declarations: [AppComponent, ExperimentComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
