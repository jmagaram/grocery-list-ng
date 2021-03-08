import { createPassword } from './data-functions';
import { assert } from 'chai';

describe('password', () => {
  it('password length is at least 7 characters', () => {
    const p = createPassword();
    assert.isAtLeast(p.length, 7);
  });

  it('passwords are different', () => {
    const a = createPassword();
    const b = createPassword();
    const c = createPassword();
    assert.notEqual(a, b);
    assert.notEqual(b, c);
    assert.notEqual(a, c);
  });

  it('password never has letter i', () => {
    assertDoesNotInclude('i');
  });

  it('password never has letter I', () => {
    assertDoesNotInclude('I');
  });

  it('password never has letter o', () => {
    assertDoesNotInclude('o');
  });

  it('password never has letter O', () => {
    assertDoesNotInclude('o');
  });

  it('password never has zero', () => {
    assertDoesNotInclude('0');
  });

  it('password never has letter l', () => {
    assertDoesNotInclude('l');
  });

  it('password never has letter L', () => {
    assertDoesNotInclude('L');
  });

  const assertDoesNotInclude = (s: string) => {
    for (let i = 0; i < 100; i++) {
      const password = createPassword();
      assert.isNotTrue(password.includes(s));
    }
  };
});
