import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, pipe, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Invitation, invitationCollection } from '../firestore/data-types';
import { maxBy, reduce } from 'ramda';
import { createInvitation } from '../firestore/data-functions';

type Invite = Invitation<'read'>;

@Component({
  selector: 'app-membership-manager',
  templateUrl: './membership-manager.component.html',
  styleUrls: ['./membership-manager.component.scss'],
})
export class MembershipManagerComponent implements OnInit {
  invitations$: Observable<Invite[]>;
  currentInvitation$: Observable<Invite | 'none'>;
  canCreateInvitation$: Observable<boolean>;

  constructor(readonly fs: AngularFirestore, readonly auth: AngularFireAuth) {
    this.invitations$ = fs
      .collection<Invite>(invitationCollection)
      .valueChanges();
    this.currentInvitation$ = this.invitations$.pipe(
      map((i) => this.mostRecentInvitation(i))
    );
    this.canCreateInvitation$ = combineLatest(
      [auth.user, this.currentInvitation$],
      (i, j) => i !== null && !i.isAnonymous && j === 'none'
    );
  }

  ngOnInit(): void {}

  mostRecentInvitation = (invites: Invite[]): Invite | 'none' =>
    invites.length === 0
      ? 'none'
      : reduce<Invite, Invite>(
          (i, j) => maxBy<Invite>((x) => x.createdOn, i, j),
          invites[0],
          invites
        );

  createInvitation = () => {
    // const doc = this.auth.user. . createInvitation()
    // this.fs.collection(invitationCollection).doc().set()
  };
}
