// From https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/test/firestore.spec.js

/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from 'fs';
import * as http from 'http';
import { pipe } from 'fp-ts/function';
import {
  initializeTestApp,
  initializeAdminApp,
  clearFirestoreData,
  loadFirestoreRules,
  assertFails,
  assertSucceeds,
  firestore,
} from '@firebase/rules-unit-testing';
import { before, beforeEach, after, afterEach, describe, it } from 'mocha';
import {
  CollectionReference,
  DocumentData,
  FirebaseFirestore,
} from '@firebase/firestore-types';
import {
  groceryListCollection,
  CollectionName,
  UserToken,
  GroceryList,
} from '../../src/app/firestore/data-types';
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
};

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

const getCollection = (
  fb: FirebaseFirestore,
  c: CollectionName
): CollectionReference<DocumentData> => fb.collection(c);

describe('security rules : grocery list', () => {
  describe('create', () => {
    interface TestData {
      comment: string;
      user: Auth | undefined;
      doc: GroceryList<'create'>;
      expectation: TestResult;
    }

    const createGroceryListFromToken = (
      token: UserToken
    ): GroceryList<'create'> =>
      createGroceryList({
        userId: token.uid,
        displayName: token.name,
        emailAddress: token.email?.address,
        emailVerified: token.email === undefined ? false : token.email.verified,
        serverTimestamp: firestore.FieldValue.serverTimestamp(),
      });

    const tests: TestData[] = [
      {
        comment: 'id : allow if id == user id',
        user: ME,
        doc: createGroceryListFromToken(ME_TOKEN),
        expectation: 'pass',
      },
      {
        comment: 'id : deny if id != user id',
        user: ME,
        doc: createGroceryListFromToken(SOMEONE_ELSE_TOKEN),
        expectation: 'fail',
      },
    ];

    tests.forEach((t) => {
      it(`${t.comment}`, async () => {
        const doc = pipe(
          userApp(t.user),
          (i) => getCollection(i, groceryListCollection),
          (i) => i.doc(t.doc.id)
        );
        switch (t.expectation) {
          case 'pass':
            await assertSucceeds(doc.set(t.doc));
            break;
          case 'fail':
            await assertFails(doc.set(t.doc));
            break;
        }
      });
    });
  });
});
