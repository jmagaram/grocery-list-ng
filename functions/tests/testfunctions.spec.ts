import { describe, it, before } from 'mocha';
import * as test from 'firebase-functions-test';
import { assert } from 'chai';
import * as admin from 'firebase-admin';
import { createShoppingList } from '../src/index';
import {
  // eslint-disable-next-line no-unused-vars
  ShoppingList,
  shoppingListCollection,
} from '../../src/app/firestore/data-types';

// Maybe type this in console before running tests and starting the emulator but
// it seems to work from the Mocha explorer when setting the environment
// variables in settings.
// GOOGLE_APPLICATION_CREDENTIALS=/Users/justi/source/repos/grocery-list-ng/functions/firebase-service-account-private-key.json

describe('firebase functions', () => {
  before(() => {});

  it('can create shopping list when user is created', async () => {
    const uid: string = 'someid' + Math.random().toString();
    const t = test();
    try {
      let user = t.auth.exampleUserRecord();
      user.uid = uid;
      user.displayName = 'bob';
      const wrapped = t.wrap(createShoppingList);
      await wrapped(user);
      let doc = await admin
        .firestore()
        .collection(shoppingListCollection)
        .doc(uid)
        .get();
      assert.isTrue(doc.exists);
      let sl = doc.data() as ShoppingList<'read'>;
      assert.strictEqual(sl.owner.uid, uid);
      assert.strictEqual(sl.owner.name, user.displayName);
      assert.strictEqual(sl.owner.email?.address, user.email);
      assert.strictEqual(sl.owner.email?.verified, user.emailVerified);
      assert.strictEqual(Object.keys(sl.members).length, 0);
    } finally {
      await admin
        .firestore()
        .collection(shoppingListCollection)
        .doc(uid)
        .delete();
      t.cleanup();
    }
  });
});
