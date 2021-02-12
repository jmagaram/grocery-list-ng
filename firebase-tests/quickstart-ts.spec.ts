// From https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/test/firestore.spec.js

import * as fs from 'fs';
import * as http from 'http';
import {
  initializeTestApp,
  clearFirestoreData,
  loadFirestoreRules,
  apps,
  assertFails,
  assertSucceeds,
  firestore,
} from '@firebase/rules-unit-testing';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { before, beforeEach, after, afterEach, describe, it } from 'mocha';

describe('firestore rules tests', () => {
  /**
   * The emulator will accept any project ID for testing.
   */
  const PROJECT_ID = 'firestore-emulator-example';

  /**
   * The FIRESTORE_EMULATOR_HOST environment variable is set automatically
   * by "firebase emulators:exec"
   */
  const COVERAGE_URL = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;

  /**
   * Creates a new client FirebaseApp with authentication and returns the Firestore instance.
   */
  function getAuthedFirestore(auth: TokenOptions | undefined) {
    return initializeTestApp({ projectId: PROJECT_ID, auth }).firestore();
  }

  beforeEach(async () => {
    // Clear the database between tests
    await clearFirestoreData({ projectId: PROJECT_ID });
  });

  before(async () => {
    // Load the rules file before the tests begin
    // Not sure this is necessary
    const rules = fs.readFileSync('./firestore.rules', 'utf8');
    await loadFirestoreRules({ projectId: PROJECT_ID, rules });
  });

  after(async () => {
    // Delete all the FirebaseApp instances created during testing
    // Note: this does not affect or clear any data
    await Promise.all(apps().map((app) => app.delete()));

    // Write the coverage report to a file
    // const coverageFile = 'firestore-coverage.html';
    // const fstream = fs.createWriteStream(coverageFile);
    // await new Promise((resolve, reject) => {
    //   http.get(COVERAGE_URL, (res) => {
    //     res.pipe(fstream, { end: true });

    //     res.on('end', resolve);
    //     res.on('error', reject);
    //   });
    // });
    // console.log(
    //   `View firestore rule coverage information at ${coverageFile}\n`
    // );
  });

  it('require users to log in before creating a profile', async () => {
    const db = getAuthedFirestore(undefined);
    const profile = db.collection('users').doc('alice');
    await assertFails(profile.set({ birthday: 'January 1' }));
  });

  it('should enforce the createdAt date in user profiles', async () => {
    const db = getAuthedFirestore({ uid: 'alice' });
    const profile = db.collection('users').doc('alice');
    await assertFails(profile.set({ birthday: 'January 1' }));
    await assertSucceeds(
      profile.set({
        birthday: 'January 1',
        createdAt: firestore.FieldValue.serverTimestamp(),
      })
    );
  });

  it('should only let users create their own profile', async () => {
    const db = getAuthedFirestore({ uid: 'alice' });
    await assertSucceeds(
      db.collection('users').doc('alice').set({
        birthday: 'January 1',
        createdAt: firestore.FieldValue.serverTimestamp(),
      })
    );
    await assertFails(
      db.collection('users').doc('bob').set({
        birthday: 'January 1',
        createdAt: firestore.FieldValue.serverTimestamp(),
      })
    );
  });

  it('should let anyone read any profile', async () => {
    const db = getAuthedFirestore(undefined);
    const profile = db.collection('users').doc('alice');
    await assertSucceeds(profile.get());
  });

  it('should let anyone create a room', async () => {
    const db = getAuthedFirestore({ uid: 'alice' });
    const room = db.collection('rooms').doc('firebase');
    await assertSucceeds(
      room.set({
        owner: 'alice',
        topic: 'All Things Firebase',
      })
    );
  });

  it('should force people to name themselves as room owner when creating a room', async () => {
    const db = getAuthedFirestore({ uid: 'alice' });
    const room = db.collection('rooms').doc('firebase');
    await assertFails(
      room.set({
        owner: 'scott',
        topic: 'Firebase Rocks!',
      })
    );
  });

  it('should not let one user steal a room from another user', async () => {
    const alice = getAuthedFirestore({ uid: 'alice' });
    const bob = getAuthedFirestore({ uid: 'bob' });

    await assertSucceeds(
      bob.collection('rooms').doc('snow').set({
        owner: 'bob',
        topic: 'All Things Snowboarding',
      })
    );

    await assertFails(
      alice.collection('rooms').doc('snow').set({
        owner: 'alice',
        topic: 'skiing > snowboarding',
      })
    );
  });
});
