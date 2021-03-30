import { Component, OnInit, ViewChild } from '@angular/core';
import { ShareUiComponent } from '../share-ui/share-ui.component';
import { Action, Invite, User } from '../share-ui/share-ui.component';

@Component({
  selector: 'app-share-ui-try',
  templateUrl: './share-ui-try.component.html',
  styleUrls: ['./share-ui-try.component.scss'],
})
export class ShareUiTryComponent implements OnInit {
  @ViewChild('component')
  shareUi?: ShareUiComponent;
  requestedInvite?: Required<User>;
  requestedInviteAsString = '';
  readonly mike: User = { uid: 'mike-uid', displayName: 'Bob' };
  readonly mikeNoDisplayName: User = { ...this.mike, displayName: undefined };
  readonly noInvitationUri: Invite = { invite: 'none' };
  readonly creatingInvite: Invite = { invite: 'creating' };
  readonly mikeInviteUri: Invite = {
    invite: 'exists',
    uri: 'http://ourgroceries.app/share/mike123xyz-345aef',
  };
  readonly whitespaceNoDisplayName: User = {
    uid: 'white-uid',
    displayName: '  ',
  };
  constructor() {}

  ngOnInit(): void {}

  guest = () => this.shareUi?.send({ action: 'guestOrNotSignedIn' });

  error = () =>
    this.shareUi?.send({
      action: 'errorCreatingInvite',
      error: 'Could not connect to the network at this time.',
    });

  signedIn = (a: Action & { action: 'authorized' }) => this.shareUi?.send(a);

  authorized = (user: User, invite: Invite) =>
    this.signedIn({ action: 'authorized', user, invite });

  onCreateInvite = (i: Required<User>) => {
    this.requestedInvite = i;
    this.requestedInviteAsString = JSON.stringify(i);
  };
}
