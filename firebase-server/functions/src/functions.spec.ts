import * as testFeatures from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { describe, it, beforeEach, after } from 'mocha';
import { assert } from 'chai';
import { GroceryList } from '../../../src/app/firestore/data-types';
import {
  createGroceryList,
  invitationPassword,
} from '../../../src/app/firestore/data-functions';
import {
  createGroceryListOnUserCreate,
  deleteGroceryListOnUserDelete,
  deleteInvitationsOnUserDelete,
} from './functions';
import { Collections } from '../../../src/app/firestore/data.service';
import { timeout } from '../../../src/app/common/utilities';

// Maybe type this in console before running tests and starting the emulator but
// it seems to work from the Mocha explorer when setting the environment
// variables in settings.
// GOOGLE_APPLICATION_CREDENTIALS=/Users/justi/source/repos/grocery-list-ng/firebase/functions/service-account-private-key.json

describe('firebase functions', () => {
  const PROJECT_ID = 'firestore-emulator-tests-project';
  const test = testFeatures({ projectId: PROJECT_ID });

  const BOB = test.auth.makeUserRecord({
    uid: 'bob_id',
    email: 'bob@google.com',
    displayName: 'Bob',
    emailVerified: true,
  });

  const ANONYMOUS = () => {
    let result = test.auth.makeUserRecord({
      uid: 'anonymous_id',
      emailVerified: false,
    });
    delete result.displayName;
    return result;
  };

  const deleteCollection = async (name: string) => {
    const docs = await admin.firestore().collection(name).get();
    docs.forEach((d) => d.ref.delete());
  };

  beforeEach(async () => {
    // TODO This is not clearing the data
    await test.firestore.clearFirestoreData({ projectId: PROJECT_ID });

    await deleteCollection(Collections.groceryList);
    await deleteCollection(Collections.invitations);
  });

  after(() => {
    test.cleanup();
  });

  it('when create user, create corresponding grocery list', async () => {
    const wrapped = test.wrap(createGroceryListOnUserCreate);
    await wrapped(BOB);
    let doc = await admin
      .firestore()
      .collection(Collections.groceryList)
      .doc(BOB.uid)
      .get();
    assert.isTrue(doc.exists);
    let d = doc.data() as GroceryList;
    assert.strictEqual(d.owner?.name, BOB.displayName);
    assert.strictEqual(d.owner?.email?.address, BOB.email);
    assert.strictEqual(d.owner?.email?.verified, BOB.emailVerified);
    assert.strictEqual(Object.keys(d.members).length, 0);
  });

  it('when create anonymous user, create corresponding grocery list', async () => {
    let anonymous = ANONYMOUS();
    const wrapped = test.wrap(createGroceryListOnUserCreate);
    await wrapped(anonymous);
    let doc = await admin
      .firestore()
      .collection(Collections.groceryList)
      .doc(anonymous.uid)
      .get();
    assert.isTrue(doc.exists);
    let d = doc.data() as GroceryList;
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
      .collection(Collections.groceryList)
      .doc(groceryListDoc.id)
      .set(groceryListDoc);
    const wrapped = test.wrap(deleteGroceryListOnUserDelete);
    await wrapped(BOB);
    let doc = await admin
      .firestore()
      .collection(Collections.groceryList)
      .doc(BOB.uid)
      .get();
    assert.isFalse(doc.exists);
  });

  it('when delete user, delete their grocery list invitiations', async () => {
    // TODO Brittle; not using a common constructor and type
    let invite = {
      owner: BOB.uid,
      createdOn: admin.firestore.FieldValue.serverTimestamp(),
      version: '1',
    };
    const inviteCount = 20;
    for (let i = 0; i < inviteCount; i++) {
      const password = invitationPassword();
      await admin
        .firestore()
        .collection(Collections.invitations)
        .doc(password)
        .set(invite);
    }

    const query = admin
      .firestore()
      .collection(Collections.invitations)
      .where('owner', '==', BOB.uid);

    const docs = await query.get();
    assert.strictEqual(docs.size, inviteCount);

    const wrapped = test.wrap(deleteInvitationsOnUserDelete);
    await wrapped(BOB);
    await timeout(1000); // Do not know why this is necessary
    const docsAfter = await query.get();
    assert.strictEqual(docsAfter.size, 0);
  });
});
