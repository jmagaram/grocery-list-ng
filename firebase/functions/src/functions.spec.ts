import * as testFeatures from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { describe, it, beforeEach, after } from 'mocha';
import { assert } from 'chai';
import { GroceryList } from '../../../src/app/firestore/data-types';
import { createGroceryList } from '../../../src/app/firestore/data-functions';
import {
  createGroceryListOnUserCreate,
  deleteGroceryListOnUserDelete,
} from './functions';
import { CollectionNames } from '../../../src/app/firestore/data.service';

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

  const ANONYMOUS = (): UserRecord => {
    let result = test.auth.makeUserRecord({
      uid: 'anonymous_id',
      emailVerified: false,
    });
    delete result.displayName;
    return result;
  };

  beforeEach(async () => {
    await test.firestore.clearFirestoreData({ projectId: PROJECT_ID });
  });

  after(() => {
    test.cleanup();
  });

  it('when create user, create corresponding grocery list', async () => {
    await admin // TODO Figure out why this is necessary
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(BOB.uid)
      .delete();
    const wrapped = test.wrap(createGroceryListOnUserCreate);
    await wrapped(BOB);
    let doc = await admin
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(BOB.uid)
      .get();
    assert.isTrue(doc.exists);
    let d = doc.data() as GroceryList;
    assert.strictEqual(d.id, BOB.uid);
    assert.strictEqual(d.owner?.name, BOB.displayName);
    assert.strictEqual(d.owner?.email?.address, BOB.email);
    assert.strictEqual(d.owner?.email?.verified, BOB.emailVerified);
    assert.strictEqual(Object.keys(d.members).length, 0);
  });

  it('when create anonymous user, create corresponding grocery list', async () => {
    let anonymous = ANONYMOUS();
    await admin // TODO Figure out why this is necessary
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(anonymous.uid)
      .delete();
    const wrapped = test.wrap(createGroceryListOnUserCreate);
    await wrapped(anonymous);
    let doc = await admin
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(anonymous.uid)
      .get();
    assert.isTrue(doc.exists);
    let d = doc.data() as GroceryList;
    assert.strictEqual(d.id, anonymous.uid);
    assert.isUndefined(d.owner?.name);
    assert.isUndefined(d.owner?.email);
    assert.strictEqual(Object.keys(d.members).length, 0);
  });

  it('when delete user, delete their grocery list', async () => {
    const groceryListDoc = createGroceryList({
      userId: BOB.uid,
      emailVerified: BOB.emailVerified,
      displayName: BOB.displayName,
      emailAddress: BOB.email,
      now: admin.firestore.FieldValue.serverTimestamp(),
    });
    await admin
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(groceryListDoc.id)
      .set(groceryListDoc);
    const wrapped = test.wrap(deleteGroceryListOnUserDelete);
    await wrapped(BOB); // TODO What is this wrapped thing for? On a constant?
    let doc = await admin
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(BOB.uid)
      .get();
    assert.isFalse(doc.exists);
  });
});
