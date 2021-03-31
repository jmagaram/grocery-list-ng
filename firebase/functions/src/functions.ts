// Could optimize cold start performance since all these imports are not needed
// for every function. https://tinyurl.com/ycgflp9z

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createGroceryList } from '../../../src/app/firestore/data-functions';
import { CollectionNames } from '../../../src/app/firestore/data.service';

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export const deleteGroceryListOnUserDelete = functions.auth
  .user()
  .onDelete(async (user) => {
    await admin
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(user.uid)
      .delete();
  });

export const createGroceryListOnUserCreate = functions.auth
  .user()
  .onCreate(async (user) => {
    let doc = createGroceryList({
      now: admin.firestore.FieldValue.serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName,
      emailAddress: user.email,
      emailVerified: user.emailVerified,
    });
    await admin
      .firestore()
      .collection(CollectionNames.groceryList)
      .doc(doc.id)
      .create(doc);
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
