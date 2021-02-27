import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthPlaygroundComponent } from './auth-playground/auth-playground.component';
import { ExperimentComponent } from './experiment/experiment.component';
import { GroceryListComponent } from './grocery-list/grocery-list.component';
import { MembershipManagerComponent } from './membership-manager/membership-manager.component';
import { SignInComponent } from './sign-in/sign-in.component';
import {
  AngularFireAuthGuard,
  hasCustomClaim,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  loggedIn,
} from '@angular/fire/auth-guard';

const redirectUnauthenticatedToSignIn = () => redirectUnauthorizedTo('signin');

const routes: Routes = [
  { path: 'experiment', component: ExperimentComponent },
  { path: 'authplayground', component: AuthPlaygroundComponent },
  { path: 'membership', component: MembershipManagerComponent },
  { path: 'signin', component: SignInComponent },
  {
    path: 'grocerylist',
    component: GroceryListComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthenticatedToSignIn },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
