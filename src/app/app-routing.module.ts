import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthPlaygroundComponent } from './auth-playground/auth-playground.component';
import { ExperimentComponent } from './experiment/experiment.component';
import { GroceryListComponent } from './grocery-list/grocery-list.component';
import {
  AngularFireAuthGuard,
  hasCustomClaim,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  loggedIn,
} from '@angular/fire/auth-guard';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignInProcessEmailLinkComponent } from './sign-in-process-email-link/sign-in-process-email-link.component';
import { ProfileComponent } from './profile/profile.component';
import { ScratchpadComponent } from './scratchpad/scratchpad.component';
import { ShareUiTryComponent } from './share-ui-try/share-ui-try.component';
import { MembersComponent } from './members/members.component';

const redirectUnauthenticatedToSignIn = () => redirectUnauthorizedTo('signin');

const routes: Routes = [
  { path: 'scratchpad', component: ScratchpadComponent },
  { path: 'experiment', component: ExperimentComponent },
  { path: 'authplayground', component: AuthPlaygroundComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'members', component: MembersComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    // canActivate: [AngularFireAuthGuard],
    // data: { authGuardPipe: redirectUnauthenticatedToSignIn },
  },
  {
    path: 'signinprocessemaillink',
    component: SignInProcessEmailLinkComponent,
  },
  {
    path: 'grocerylist',
    component: GroceryListComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthenticatedToSignIn },
  },
  { path: 'try-shareui', component: ShareUiTryComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
