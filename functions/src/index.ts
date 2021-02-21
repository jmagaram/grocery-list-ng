// Could optimize cold start performance since all these imports are not needed
// for every function.
// https://tinyurl.com/ycgflp9z

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as ShoppingListModule from '../../src/app/firestore/shopping-list';
import { shoppingListCollection } from '../../src/app/firestore/data-types';

admin.initializeApp();

function configureFirestore(f: FirebaseFirestore.Firestore) {
  f.settings({ ignoreUndefinedProperties: true });
  return f;
}

export const createShoppingList = functions.auth
  .user()
  .onCreate(async (user) => {
    let shoppingList = ShoppingListModule.create({
      userId: user.uid,
      displayName: user.displayName,
      emailAddress: user.email,
      emailVerified: user.emailVerified,
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    await configureFirestore(admin.firestore())
      .collection(shoppingListCollection)
      .doc(user.uid)
      .create(shoppingList);
  });

type Message = { asTypedByUser: string; uppercased: string | null };

export const createUser = functions.https.onRequest(async (req, response) => {
  let userName: string = req.query.name as string;
  await admin.auth().createUser({
    displayName: userName,
  });
  response.send('Success!');
});

export const addMessage = functions.https.onRequest(async (req, res) => {
  let message: Message = {
    asTypedByUser: req.query.text as string,
    uppercased: null,
  };
  const writeResult = await admin
    .firestore()
    .collection('messages')
    .add(message);
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

export const makeUppercase = functions.firestore
  .document('/messages/{documentId}')
  .onWrite((snap, context) => {
    const before = snap.before.data() as Message | undefined;
    const after = snap.after.data() as Message;
    if (before == undefined || before.asTypedByUser != after.asTypedByUser) {
      after.uppercased = after.asTypedByUser.toUpperCase();
      functions.logger.log('UPPERCASING log', context.params.documentId, after);
      return snap.after.ref.set(after);
    } else {
      return Promise.resolve();
    }
  });
