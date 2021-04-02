import { invitationPassword } from './data-functions';

describe('password', () => {
  it('password length is at least 7 characters', () => {
    const p = invitationPassword();
    expect(p.length).toBeGreaterThanOrEqual(7);
  });

  it('passwords are different', () => {
    const a = invitationPassword();
    const b = invitationPassword();
    const c = invitationPassword();
    expect(a).not.toEqual(b);
    expect(b).not.toEqual(c);
    expect(a).not.toEqual(c);
  });

  it('password never has letter i', () => {
    assertDoesNotInclude('i');
  });

  it('password never has letter I', () => {
    assertDoesNotInclude('I');
  });

  it('password never has letter t', () => {
    assertDoesNotInclude('t');
  });

  it('password never has letter f', () => {
    assertDoesNotInclude('f');
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
      const password = invitationPassword();
      expect(password.includes(s)).toBeFalse();
    }
  };
});
