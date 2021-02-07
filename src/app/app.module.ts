import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// https://docs.amplify.aws/start/getting-started/setup/q/integration/angular#install-amplify-libraries
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AmplifyTestComponent } from './amplify-test/amplify-test.component';

@NgModule({
  declarations: [AppComponent, AmplifyTestComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // https://docs.amplify.aws/start/getting-started/setup/q/integration/angular#install-amplify-libraries
    AmplifyUIAngularModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
