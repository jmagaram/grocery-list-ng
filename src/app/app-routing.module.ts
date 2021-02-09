import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthPlaygroundComponent } from './auth-playground/auth-playground.component';
import { ExperimentComponent } from './experiment/experiment.component';

const routes: Routes = [
  { path: 'experiment', component: ExperimentComponent },
  { path: 'authplayground', component: AuthPlaygroundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
