import { describe, it } from 'mocha';
import { assert } from 'chai';

describe('basic math', () => {
  it('can add', () => {
    assert.strictEqual(1 + 1, 2);
  });

  it('can multiply', () => {
    assert.strictEqual(2 * 3, 6);
  });
});
