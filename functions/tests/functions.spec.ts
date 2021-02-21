import { describe, it } from 'mocha';
// import { before, beforeEach, after, afterEach, describe, it } from 'mocha';
import { assert } from 'chai';

// import * as test from 'firebase-functions-test';
// import * as functions from 'firebase-functions';
// import { helloWorld } from '..';

describe('cloud functions', () => {
  it('can add', () => {
    assert.strictEqual(1 + 1, 2);
  });

  it('can multiply', () => {
    assert.strictEqual(2 * 3, 6);
  });

  // describe('onEpisodeTrackCreated', () => {
  //   it('successfully invokes function', async () => {
  //     const wrapped = test.wrap(functions.onEpisodeTrackCreated);
  //     const data = { name: 'hello - world', broadcastAt: new Date() }
  //     await wrapped({
  //       data: () => ({
  //         name: 'hello - world'
  //       }),
  //       ref:{
  //         set: jest.fn()
  //       }
  //     })
  //   })
  // })

  // https://github.com/robisim74/firebase-functions-typescript-starter/blob/master/functions/tests/analisys.spec.ts

  // it('hello world', () => {
  //   functions.https.onCall()
  //   const wrapped = test().wrap(helloWorld);
  //   const req = {
  //     query: {},
  //     body: {},
  //   };
  //   t.wrap(helloWorld)
  //   // A fake response object, with a stubbed redirect function which asserts that it is called
  //   // with parameters 303, 'new_ref'.
  //   const res = {
  //     redirect: (code, url) => {
  //       assert.equal(code, 303);
  //       assert.equal(url, 'new_ref');
  //     },
  //   };
  //   test().c.wrap();
  //   helloWorld(req, res);
  //   t.cleanup();
  // });
});
