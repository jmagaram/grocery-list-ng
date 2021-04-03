import { TestBed } from '@angular/core/testing';
import { filter, take } from 'rxjs/operators';
import { appConfig } from '../app.module';

import {
  DataCommandsService,
  DataQueriesService,
  OwnedInvitations,
} from './data.service';
import { EmulatorUtilityService } from './emulator-utility.service';
import { AngularFireAuth } from '@angular/fire/auth';

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

  describe('createInvitation', () => {
    beforeEach(async () => {
      // TODO Make sure there is no way this is going to delete real data
      const projectId = 'grocery-list-ng-223b6';
      await em.deleteUserAccounts(projectId);
      await em.deleteFirestoreData(projectId);
    });

    const tryCreate = async (
      name: string = 'bob',
      email: string = 'bob@gmail.com',
      exists: (o: OwnedInvitations & { auth: 'registered' }) => boolean
    ): Promise<OwnedInvitations> => {
      const usr = await em.createEmailPasswordUser(email);
      await em.signIn(usr.email);
      await cmd.createInvitation(name);
      return await qry
        .ownedInvitations()
        .pipe(
          filter((i) => i.auth === 'registered' && exists(i)),
          take(1)
        )
        .toPromise();
    };

    it('exactly one returned', async () => {
      const res = await tryCreate(
        'kelly',
        'kelly@gmail.com',
        (i) => i.invitations.length === 1
      );
      expect(res).toBeTruthy();
    });

    it('when user name provided, it is returned', async () => {
      const res = await tryCreate(
        'joe',
        'joe@gmail.com',
        (i) => i.name === 'joe'
      );
      expect(res).toBeTruthy();
    });

    it('when user name provided and name did not exist, token is updated', async () => {
      const usr = await em.createEmailPasswordUser('john@google.com');
      await em.signIn(usr.email);
      await cmd.createInvitation('john');
      const p = await auth.currentUser;
      expect(p?.displayName).toEqual('john');
    });

    it('createdOn is close to now', async () => {
      const res = await tryCreate('mark', 'mark@gmail.com', (i) => {
        const nowMs = Date.now().valueOf();
        const createdOnMs = i.invitations[0].createdOn.valueOf();
        return nowMs - createdOnMs < 10000;
      });
      expect(res).toBeTruthy();
    });
  });
});
