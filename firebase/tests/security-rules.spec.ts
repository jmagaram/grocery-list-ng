// From https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/test/firestore.spec.js

import * as fs from 'fs';
import * as http from 'http';
import { pipe } from 'ramda';
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
import { FirebaseFirestore } from '@firebase/firestore-types';
import {
  groceryListCollection,
  CollectionName,
  UserToken,
} from '../../src/app/firestore/data-types';
import { assert } from 'chai';
import { createGroceryList } from '../../src/app/firestore/data-functions';
import * as firebase from 'firebase';

const PROJECT_ID = 'firestore-emulator-tests-project';

beforeEach(async () => {
  await clearFirestoreData({ projectId: PROJECT_ID });
});

before(async () => {
  // Necessary? The emulator seems to load rules automatically.
  const rules = fs.readFileSync('./firestore.rules', 'utf8');
  await loadFirestoreRules({ projectId: PROJECT_ID, rules });
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

function toUserToken(auth: Auth): UserToken {
  if (!auth.uid) throw 'No UID; valid scenario?';
  let res: UserToken = { uid: auth.uid };
  if (auth.name) {
    res['name'] = auth.name;
  }
  if (auth.email) {
    if (!auth.email_verified)
      throw 'The email was provided but verification was not; valid scenario?';
    res['email'] = {
      address: auth.email,
      verified: auth.email_verified,
    };
  }
  return res;
}

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

function userApp(auth: Auth | undefined) {
  return initializeTestApp({ projectId: PROJECT_ID, auth }).firestore();
}

function adminApp() {
  return initializeAdminApp({ projectId: PROJECT_ID }).firestore();
}

function getCollection(fb: FirebaseFirestore, c: CollectionName) {
  return fb.collection(c);
}

describe('security rules : list', () => {
  describe('create', () => {
    interface TestData {
      comment: string;
      user: Auth | undefined;
      doc: any;
      expectation: TestResult;
    }

    function createGroceryListFromToken(token: UserToken) {
      return createGroceryList({
        userId: token.uid,
        displayName: token.name,
        emailAddress: token.email?.address,
        emailVerified: token.email == undefined ? false : token.email.verified,
        serverTimestamp: firestore.FieldValue.serverTimestamp(),
      });
    }

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
      it(`${t.comment}`, async function () {
        const doc = pipe(
          () => userApp(t.user),
          (i) => getCollection(i, groceryListCollection),
          (i) => i.doc(t.doc.id)
        )();
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
