import { createPassword } from './shopping-list';
import { assert } from 'chai';

describe('password', () => {
  it('password length is 8 like a phone number', () => {
    let p = createPassword();
    assert.equal(p.length, 8);
    assert.equal(p[3], '-');
  });

  it('passwords are different', () => {
    let a = createPassword();
    let b = createPassword();
    let c = createPassword();
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

  function assertDoesNotInclude(s: string) {
    for (let i = 0; i < 100; i++) {
      let password = createPassword();
      assert.isNotTrue(password.includes(s));
    }
  }
});
