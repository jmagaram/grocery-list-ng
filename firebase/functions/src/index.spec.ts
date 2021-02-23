import * as testFeatures from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { describe, it, beforeEach, after } from 'mocha';
import { assert } from 'chai';
import {
  GroceryList,
  groceryListCollection,
} from '../../../src/app/firestore/data-types';
import { createGroceryList } from '../../../src/app/firestore/data-functions';
import {
  createGroceryListOnUserCreate,
  deleteGroceryListOnUserDelete,
} from './index';

// Maybe type this in console before running tests and starting the emulator but
// it seems to work from the Mocha explorer when setting the environment
// variables in settings.
// GOOGLE_APPLICATION_CREDENTIALS=/Users/justi/source/repos/grocery-list-ng/firebase/functions/service-account-private-key.json

describe('firebase functions', () => {
  const PROJECT_ID = 'firestore-emulator-tests-project';
  const test = testFeatures({ projectId: PROJECT_ID });
  type UserRecord = admin.auth.UserRecord;

  const BOB: UserRecord = test.auth.makeUserRecord({
    uid: 'bob_id',
    email: 'bob@google.com',
    displayName: 'Bob',
    emailVerified: true,
  });

  beforeEach(async () => {
    await test.firestore.clearFirestoreData({ projectId: PROJECT_ID });
  });

  after(() => {
    test.cleanup();
  });

  it('when create user, create corresponding grocery list', async () => {
    const wrapped = test.wrap(createGroceryListOnUserCreate);
    await wrapped(BOB);
    let doc = await admin
      .firestore()
      .collection(groceryListCollection)
      .doc(BOB.uid)
      .get();
    assert.isTrue(doc.exists);
    let d = doc.data() as GroceryList<'read'>;
    assert.strictEqual(d.owner.uid, BOB.uid);
    assert.strictEqual(d.owner.name, BOB.displayName);
    assert.strictEqual(d.owner.email?.address, BOB.email);
    assert.strictEqual(d.owner.email?.verified, BOB.emailVerified);
    assert.strictEqual(Object.keys(d.members).length, 0);
  });

  it('when delete user, delete their grocery list', async () => {
    const groceryListDoc: GroceryList<'create'> = createGroceryList({
      userId: BOB.uid,
      emailVerified: BOB.emailVerified,
      displayName: BOB.displayName,
      emailAddress: BOB.email,
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    await admin
      .firestore()
      .collection(groceryListCollection)
      .doc(groceryListDoc.id)
      .set(groceryListDoc);
    const wrapped = test.wrap(deleteGroceryListOnUserDelete);
    await wrapped(BOB);
    let doc = await admin
      .firestore()
      .collection(groceryListCollection)
      .doc(BOB.uid)
      .get();
    assert.isFalse(doc.exists);
  });
});
