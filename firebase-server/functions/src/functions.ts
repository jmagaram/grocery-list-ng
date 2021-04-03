// Could optimize cold start performance since all these imports are not needed
// for every function. https://tinyurl.com/ycgflp9z
// TODO Figure out how to localize the error messages sent to the client

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createGroceryList } from '../../../src/app/firestore/data-functions';
import { Collections } from '../../../src/app/firestore/data.service';
import {
  Invitation,
  InvitationDetails,
  GroceryList,
} from '../../../src/app/firestore/data-types';
import { objectEntries, execPipe, map, arrayFrom } from 'iter-tools';

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export const getInvitationDetails = functions.https.onCall(
  async (data: string, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You need to be signed in to share a grocery list.'
      );
    }
    if (context.auth.token.firebase.sign_in_provider === 'anonymous') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You need to have a registered user account (not an anonymous account) to share a grocery list.'
      );
    }
    const invitationDoc = await admin
      .firestore()
      .collection(Collections.invitations)
      .doc(data)
      .get();
    if (!invitationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'The invitation could not be found. It might have expired. Ask the person who sent it to you to share their grocery list again.'
      );
    }
    const invitation = invitationDoc.data() as Invitation;
    const groceryLists = await admin
      .firestore()
      .collection(Collections.groceryList)
      .where('id', '==', `${invitation.owner}`)
      .limit(1)
      .get();
    if (groceryLists.docs.length === 0) {
      throw new functions.https.HttpsError(
        'not-found',
        'The grocery list you were invited to share could not be found.' // TODO Log this
      );
    }
    const g = groceryLists.docs[0].data() as GroceryList;
    const result: InvitationDetails = {
      owner: { uid: g.id, ...g.owner },
      members: execPipe(
        g.members,
        objectEntries,
        map((i) => ({ uid: i[0], ...i[1] })),
        arrayFrom
      ),
    };
    return result;
  }
);

export const deleteGroceryListOnUserDelete = functions.auth
  .user()
  .onDelete(async (user) => {
    await admin
      .firestore()
      .collection(Collections.groceryList)
      .doc(user.uid)
      .delete();
  });

export const deleteInvitationsOnUserDelete = functions.auth
  .user()
  .onDelete(async (user) => {
    const invites = await admin
      .firestore()
      .collection(Collections.invitations)
      .where('owner', '==', user.uid)
      .get();
    invites.forEach(async (d) => {
      await d.ref.delete();
    });
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
      .collection(Collections.groceryList)
      .doc(doc.id)
      .create({ ...doc, id: undefined });
  });
