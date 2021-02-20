import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

type Message = { asTypedByUser: string; uppercased: string | null };

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
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
      functions.logger.log('UPPERCASING', context.params.documentId, after);
      return snap.after.ref.set(after);
    } else {
      return Promise.resolve();
    }
  });
