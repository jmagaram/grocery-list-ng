import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { appConfig } from '../app.module';

import {
  DataCommandsService,
  DataQueriesService,
  OwnedInvitations,
} from './data.service';
import { EmulatorUtilityService } from './emulator-utility.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { timeout } from '../common/utilities';

// describe('DataQueriesService', () => {
//   let service: DataQueriesService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(DataQueriesService);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
// });

// TODO When delete a user, delete their invitations too
describe('DataCommandsService', () => {
  let cmd: DataCommandsService;
  let qry: DataQueriesService;
  let em: EmulatorUtilityService;
  let auth: AngularFireAuth;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [appConfig.providers],
      imports: appConfig.firebaseImports,
    });
    cmd = TestBed.inject(DataCommandsService);
    em = TestBed.inject(EmulatorUtilityService);
    qry = TestBed.inject(DataQueriesService);
    auth = TestBed.inject(AngularFireAuth);
  });

  it('can create commands service', () => {
    expect(cmd).toBeTruthy();
  });

  // TODO Test results seems to be unreliable, or code is unreliable
  // Could be delay between propagating from server to client
  // Could be delay in clearing the emulator (though adding time did not help)
  describe('createInvitation', () => {
    beforeEach(async () => {
      // TODO Make sure there is no way this is going to delete real data
      const projectId = 'grocery-list-ng-223b6';
      await em.deleteUserAccounts(projectId);
      await em.deleteFirestoreData(projectId);
    });

    const create = async (
      name: string = 'bob',
      email: string = 'bob@gmail.com'
    ): Promise<OwnedInvitations & { auth: 'registered' }> => {
      const usr = await em.createEmailPasswordUser(email);
      await em.signIn(usr.email);
      await cmd.createInvitation(name);
      await timeout(500, true); // TODO Possible hack
      const res = await qry.ownedInvitations().pipe(take(1)).toPromise();
      if (res.auth === 'registered') {
        return res;
      } else {
        throw new Error('Did not properly create the invitation.');
      }
    };

    it('exactly one returned', async () => {
      const res = await create('kelly', 'kelly@gmail.com');
      expect(res.invitations.length).toEqual(1);
    });

    it('when user name provided, it is returned', async () => {
      const res = await create('joe', 'joe@gmail.com');
      expect(res.name).toEqual('joe');
    });

    it('when user name provided and name did not exist, token is updated', async () => {
      const usr = await em.createEmailPasswordUser('john@google.com');
      await em.signIn(usr.email);
      await cmd.createInvitation('john');
      const p = await auth.currentUser;
      expect(p?.displayName).toEqual('john');
    });

    it('createdOn is close to now', async () => {
      const res = await create('mark', 'mark@gmail.com');
      const createdOnMs = res.invitations[0].createdOn.valueOf();
      const nowMs = Date.now().valueOf();
      expect(nowMs - createdOnMs).toBeLessThanOrEqual(10000);
    });
  });
});
