import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AmplifyTestComponent } from './amplify-test/amplify-test.component';

const routes: Routes = [
  { path: 'experiment', component: AmplifyTestComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
