// From https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/test/firestore.spec.js

import * as fs from 'fs';
import * as http from 'http';
import {
  initializeTestApp,
  initializeAdminApp,
  clearFirestoreData,
  loadFirestoreRules,
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { before, beforeEach, after, afterEach, describe, it } from 'mocha';
import { FirebaseFirestore } from '@firebase/firestore-types';
import { CollectionName, ShoppingList } from '../src/app/core/data-models';
import { assert } from 'chai';

const PROJECT_ID = 'firestore-emulator-example';

// FIRESTORE_EMULATOR_HOST environment variable is set automatically by
// "firebase emulators:exec" but can be set other ways.
const COVERAGE_URL = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;

function userApp(auth: TokenOptions | undefined) {
  return initializeTestApp({ projectId: PROJECT_ID, auth }).firestore();
}

function adminApp() {
  return initializeAdminApp({ projectId: PROJECT_ID }).firestore();
}

function getCollection(fb: FirebaseFirestore, c: CollectionName) {
  return fb.collection(c);
}

beforeEach(async () => {
  await clearFirestoreData({ projectId: PROJECT_ID });
});

before(async () => {
  // Is this necessary?
  const rules = fs.readFileSync('./firestore.rules', 'utf8');
  await loadFirestoreRules({ projectId: PROJECT_ID, rules });
});

after(async () => {
  // This does not affect or clear any data, so not sure what it does.
  await Promise.all(apps().map((app) => app.delete()));

  // Write the coverage report to a file
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

const JUSTIN: TokenOptions = {
  name: 'justin',
  email: 'justin@magaram.com',
  email_verified: true,
  uid: 'justin-uid',
  firebase: { sign_in_provider: 'microsoft.com' },
};

const BOB: TokenOptions = {
  name: 'bob',
  email: 'bob@yahoo.com',
  email_verified: true,
  uid: 'bob-uid',
  firebase: { sign_in_provider: 'email' },
};

const CHARLIE: TokenOptions = {
  name: 'charlie',
  email: 'charlie@yahoo.com',
  email_verified: true,
  uid: 'charlie-uid',
  firebase: { sign_in_provider: 'email' },
};

const ANONYMOUS: TokenOptions = {
  uid: 'guest-uid',
  provider_id: 'anonymous',
  firebase: { sign_in_provider: 'anonymous' },
};

type TestResult = 'pass' | 'fail';

type MinimimCloudDocument = { id: string };

type CreateContext<T extends MinimimCloudDocument, U extends CollectionName> = {
  doc: T;
  user: TokenOptions | undefined;
  collection: U;
};

async function assertCreate<
  T extends MinimimCloudDocument,
  U extends CollectionName
>(expect: TestResult, p: CreateContext<T, U>) {
  const db = userApp(p.user);
  const doc = getCollection(db, p.collection).doc();
  switch (expect) {
    case 'pass':
      await assertSucceeds(doc.set(p.doc));
      break;
    case 'fail':
      await assertFails(doc.set(p.doc));
      break;
  }
}

describe('security rules : unexpected collection', () => {
  let unexpected = 'unexpected' as CollectionName;

  it('deny write', async () => {
    await assertFails(
      getCollection(userApp(JUSTIN), 'unexpected' as CollectionName)
        .doc('some id')
        .set({ info: 'xyz' })
    );
  });

  it('deny read', async () => {
    await assertFails(
      getCollection(userApp(JUSTIN), 'unexpected' as CollectionName)
        .doc('some key')
        .get()
    );
  });

  it('deny delete', async () => {
    await assertFails(
      getCollection(userApp(JUSTIN), 'unexpected' as CollectionName)
        .doc('some key')
        .delete()
    );
  });
});

describe('security rules : shopping list', () => {
  function newShoppingList(
    owner: TokenOptions,
    members?: [userId: string, name: string][]
  ): ShoppingList {
    const memberObject =
      members == undefined ? {} : Object.fromEntries(members!);
    if (owner.provider_id == 'anonymous') {
      return { members: memberObject, id: owner.uid! };
    } else {
      return { members: memberObject, ownerName: owner.name, id: owner.uid! };
    }
  }

  describe('create', () => {
    interface ShoppingListCreateTest {
      comment: string;
      user: TokenOptions | undefined;
      doc: ShoppingList;
      expected: TestResult;
    }

    const tests: ShoppingListCreateTest[] = [
      {
        comment: 'id : allow if id == user id',
        user: JUSTIN,
        doc: { id: JUSTIN.uid!, ownerName: 'justin', members: {} },
        expected: 'pass',
      },
      {
        comment: 'id : deny if id != user id',
        user: JUSTIN,
        doc: { id: BOB.uid!, ownerName: 'justin', members: {} },
        expected: 'fail',
      },
      {
        comment: 'allow if anonymous',
        user: ANONYMOUS,
        doc: { id: ANONYMOUS.uid!, members: {} },
        expected: 'pass',
      },
      {
        comment: 'deny if not authenticated',
        user: undefined,
        doc: { id: BOB.uid!, ownerName: 'bob', members: {} },
        expected: 'fail',
      },
      {
        comment: 'members : must be empty',
        user: JUSTIN,
        doc: {
          id: JUSTIN.uid!,
          ownerName: 'justin',
          members: { bob_uid: 'bob' },
        },
        expected: 'fail',
      },
      {
        comment: 'ownerName : deny if !anonymous && ownerName != user name',
        user: JUSTIN,
        doc: {
          id: JUSTIN.uid!,
          ownerName: 'not justin',
          members: {},
        },
        expected: 'fail',
      },
      {
        comment: 'ownerName : allow if !anonymous && ownerName == user name',
        user: JUSTIN,
        doc: {
          id: JUSTIN.uid!,
          ownerName: JUSTIN.name,
          members: {},
        },
        expected: 'pass',
      },
      {
        comment: 'ownerName : deny if empty && !anonymous',
        user: JUSTIN,
        doc: {
          id: JUSTIN.uid!,
          ownerName: '',
          members: {},
        },
        expected: 'fail',
      },
      {
        comment: 'ownerName : deny if !empty && anonymous',
        user: ANONYMOUS,
        doc: {
          id: ANONYMOUS.uid!,
          ownerName: 'someone other than anonymous',
          members: {},
        },
        expected: 'fail',
      },
      {
        comment: 'ownerName : deny if ownerName is whitespace',
        user: JUSTIN,
        doc: {
          id: JUSTIN.uid!,
          ownerName: '    ',
          members: {},
        },
        expected: 'fail',
      },
    ];

    tests.forEach((t) => {
      it(`${t.comment}`, async function () {
        const db = userApp(t.user);
        const doc = getCollection(db, 'shoppinglist').doc(t.user?.uid);
        switch (t.expected) {
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

  describe('update', () => {
    it('deny if ownerName changed', async () => {
      await getCollection(adminApp(), 'shoppinglist')
        .doc(JUSTIN.uid!)
        .set(newShoppingList(JUSTIN));
      const change: Partial<ShoppingList> = { ownerName: '' };
      await assertFails(
        getCollection(userApp(JUSTIN), 'shoppinglist')
          .doc(JUSTIN.uid)
          .set(change)
      );
    });

    it('member can remove self', async () => {
      await getCollection(adminApp(), 'shoppinglist')
        .doc(JUSTIN.uid!)
        .set(
          newShoppingList(JUSTIN, [
            [BOB.uid!, BOB.name!],
            [CHARLIE.uid!, CHARLIE.name!],
          ])
        );
      const change: Partial<ShoppingList> = {
        members: Object.fromEntries([[CHARLIE.uid!, CHARLIE.name!]]),
      };
      await assertSucceeds(
        getCollection(userApp(BOB), 'shoppinglist').doc(JUSTIN.uid).set(change)
      );
    });

    it('member can not remove someone else', async () => {
      await getCollection(adminApp(), 'shoppinglist')
        .doc(JUSTIN.uid!)
        .set(
          newShoppingList(JUSTIN, [
            [BOB.uid!, BOB.name!],
            [CHARLIE.uid!, CHARLIE.name!],
          ])
        );
      const change: Partial<ShoppingList> = {
        members: Object.fromEntries([[BOB.uid!, BOB.name!]]),
      };
      await assertFails(
        getCollection(userApp(BOB), 'shoppinglist').doc(JUSTIN.uid).set(change)
      );
    });
  });

  describe('get', () => {
    it('allow if user id == doc id', async () => {
      const doc = newShoppingList(JUSTIN, [[BOB.uid!, BOB.name!]]);
      await getCollection(adminApp(), 'shoppinglist').doc(JUSTIN.uid).set(doc);
      await assertSucceeds(
        getCollection(userApp(JUSTIN), 'shoppinglist').doc(JUSTIN.uid).get()
      );
    });

    it('allow if user id in members', async () => {
      const doc = newShoppingList(JUSTIN, [[BOB.uid!, BOB.name!]]);
      await getCollection(adminApp(), 'shoppinglist').doc(JUSTIN.uid).set(doc);
      await assertSucceeds(
        getCollection(userApp(BOB), 'shoppinglist').doc(JUSTIN.uid).get()
      );
    });

    it('deny if user id not in members && user id != doc id', async () => {
      const doc = newShoppingList(JUSTIN, [[BOB.uid!, BOB.name!]]);
      await getCollection(adminApp(), 'shoppinglist').doc(JUSTIN.uid).set(doc);
      await assertFails(
        getCollection(userApp(CHARLIE), 'shoppinglist').doc(JUSTIN.uid).get()
      );
    });
  });

  describe('delete', () => {
    it('allow if user id == doc id', async () => {
      const db = userApp(JUSTIN);
      const ref = getCollection(db, 'shoppinglist').doc(JUSTIN.uid);
      await assertSucceeds(ref.delete());
    });

    it('deny if user id != doc id', async () => {
      const db = userApp(JUSTIN);
      const ref = getCollection(db, 'shoppinglist').doc(BOB.uid);
      await assertFails(ref.delete());
    });
  });
});
