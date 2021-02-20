import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const addMessage = functions.https.onRequest(async (req, res) => {
  const original = req.query.text;
  const writeResult = await admin
    .firestore()
    .collection('messages')
    .add({ original: original });
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

export const makeUppercase = functions.firestore
  .document('/messages/{documentId}')
  .onCreate((snap, context) => {
    const original = snap.data().original;
    functions.logger.log('Uppercasing', context.params.documentId, original);
    const uppercase = original.toUpperCase();
    return snap.ref.set({ uppercase }, { merge: true });
  });

export const makeUppercaseOnUpdate = functions.firestore
  .document('/messages/{documentId}')
  .onUpdate((snap, context) => {
    const original = snap.after.data().original;
    functions.logger.log('Uppercasing', context.params.documentId, original);
    const uppercase = original.toUpperCase();
    return snap.after.ref.set({ uppercase }, { merge: true });
  });
