/* eslint-disable @typescript-eslint/no-unused-vars */

// TODO Figure out why eslint isn't complaining about floating promises on 'assertSucceeds'
// TODO Previously it seemed I had to delete documents before each test; 'before' wasn't working

import * as fs from 'fs';
import * as http from 'http';
import * as admin from 'firebase-admin';
import {
  initializeTestApp,
  initializeAdminApp,
  clearFirestoreData,
  loadFirestoreRules,
  assertFails,
  assertSucceeds,
  firestore,
} from '@firebase/rules-unit-testing';
import { before, beforeEach, after, describe, it } from 'mocha';
import { FirebaseFirestore } from '@firebase/firestore-types';
import { UserToken, Claims } from '../../src/app/firestore/data-types';
import { CollectionNames } from '../../src/app/firestore/data.service';
import { createGroceryList } from '../../src/app/firestore/data-functions';

const PROJECT_ID = 'firestore-emulator-tests-project';

before(async () => {
  // Required to load rules when not using default project
  // https://github.com/firebase/firebase-tools/issues/2612
  const rulesPath = './firebase/firestore/firestore.rules';
  const rules = fs.readFileSync(rulesPath, 'utf8');
  await loadFirestoreRules({ projectId: PROJECT_ID, rules });
});

beforeEach(async () => {
  await clearFirestoreData({ projectId: PROJECT_ID });
});

after(async () => {
  // This does not affect or clear any data, so not sure what it does.
  // await Promise.all(apps().map((app) => app.delete()));

  // Write the coverage report to a file
  const COVERAGE_URL =
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/` +
    `emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;
  const coverageFile = 'firestore-coverage.html';
  const fstream = fs.createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    http.get(COVERAGE_URL, (res) => {
      res.pipe(fstream, { end: true });
      res.on('end', resolve);
      res.on('error', reject);
    });
  });
});

type Auth = {
  uid?: string;
  provider_id?: 'anonymous';
  email?: string;
  email_verified?: boolean;
  name?: string;
} & Claims;

const clientNow = () => firestore.FieldValue.serverTimestamp();
const adminNow = () => admin.firestore.FieldValue.serverTimestamp();

const toUserToken = (auth: Auth): UserToken => {
  if (!auth.uid) {
    throw new Error('No UID; valid scenario?');
  }
  const res: UserToken = { uid: auth.uid };
  if (auth.name) {
    res.name = auth.name;
  }
  if (auth.email) {
    if (!auth.email_verified) {
      throw new Error(
        'The email was provided but verification was not; valid scenario?'
      );
    }
    res.email = {
      address: auth.email,
      verified: auth.email_verified,
    };
  }
  return res;
};

const ME: Auth = {
  uid: 'me_id',
  name: 'me',
  email: 'me@google.com',
  email_verified: true,
};
const ME_TOKEN = toUserToken(ME);

const MY_SPOUSE: Auth = {
  uid: 'my_spouse_id',
  name: 'my spouse',
  email: 'spouse@google.com',
  email_verified: true,
  memberOf: ME.uid,
};
const MY_SPOUSE_TOKEN = toUserToken(MY_SPOUSE);

const SOMEONE_ELSE: Auth = {
  uid: 'someone_else_id',
  name: 'someone_else',
  email: 'someone_else@outlook.com',
  email_verified: true,
};
const SOMEONE_ELSE_TOKEN = toUserToken(SOMEONE_ELSE);

const CHARLIE: Auth = {
  uid: 'charlie_id',
  name: 'charlie',
  email: 'charlie@yahoo.com',
  email_verified: true,
};
const CHARLIE_TOKEN = toUserToken(CHARLIE);

const ANONYMOUS: Auth = {
  uid: 'anonymous_id',
  provider_id: 'anonymous',
};
const ANONYMOUS_TOKEN = toUserToken(ANONYMOUS);

type TestResult = 'pass' | 'fail';

const userApp = (auth: Auth | undefined): FirebaseFirestore =>
  initializeTestApp({ projectId: PROJECT_ID, auth }).firestore();

const adminApp = (): FirebaseFirestore =>
  initializeAdminApp({ projectId: PROJECT_ID }).firestore();

describe('security rules : grocerylist', () => {
  const createList = <NOW>(u: UserToken, now: NOW) =>
    createGroceryList({
      now,
      displayName: u.name,
      emailAddress: u.email?.address,
      emailVerified: u.email?.verified ?? false,
      userId: u.uid,
    });

  describe('read', () => {
    it('can read if owner', async () => {
      const doc = createList(ME_TOKEN, adminNow());
      await adminApp()
        .collection(CollectionNames.groceryList)
        .doc(doc.id)
        .set(doc);
      const client = userApp(ME);
      await assertSucceeds(
        client.collection(CollectionNames.groceryList).doc(ME_TOKEN.uid).get()
      );
    });

    it('can read if member', async () => {
      const doc = createList(ME_TOKEN, adminNow());
      await adminApp()
        .collection(CollectionNames.groceryList)
        .doc(doc.id)
        .set(doc);
      const client = userApp(MY_SPOUSE);
      await assertSucceeds(
        client.collection(CollectionNames.groceryList).doc(ME.uid).get()
      );
    });

    it('can not read if not owner or member', async () => {
      const doc = createList(ME_TOKEN, adminNow());
      await adminApp()
        .collection(CollectionNames.groceryList)
        .doc(doc.id)
        .set(doc);
      const client = userApp(SOMEONE_ELSE);
      await assertFails(
        client.collection(CollectionNames.groceryList).doc(ME.uid).get()
      );
    });
  });
});
