import { isNullUndefinedOrWhitespace, mapString, timeout } from './utilities';

describe('other utilities', () => {
  it('timeout - return result after expected delay', async () => {
    const start = Date.now();
    const delayMilliseconds = 1000;
    await timeout(delayMilliseconds, 'abc');
    const end = Date.now();
    expect(end - start).toBeCloseTo(delayMilliseconds, -2);
  });

  it('timeout - return the value', async () => {
    const result = await timeout(200, 'abc');
    expect(result).toEqual('abc');
  });
});

describe('string utilities', () => {
  describe('isNullUndefinedOrWhitespace', () => {
    it('undefined -> true', () => {
      expect(isNullUndefinedOrWhitespace(undefined)).toBeTrue();
    });
    it('null -> true', () => {
      expect(isNullUndefinedOrWhitespace(null)).toBeTrue();
    });
    it('whitespace -> true', () => {
      expect(isNullUndefinedOrWhitespace('     ')).toBeTrue();
    });
    it('empty -> true', () => {
      expect(isNullUndefinedOrWhitespace('')).toBeTrue();
    });
    it('untrimmed regular string -> false', () => {
      expect(isNullUndefinedOrWhitespace('  abc  ')).toBeFalse();
    });
    it('trimmed regular string -> false', () => {
      expect(isNullUndefinedOrWhitespace('abc')).toBeFalse();
    });
  });

  describe('mapString', () => {
    it('undefined -> if missing', () => {
      expect(mapString(undefined, (i) => i.toUpperCase(), -1)).toEqual(-1);
    });
    it('null -> if missing', () => {
      expect(mapString(null, (i) => i.toUpperCase(), -1)).toEqual(-1);
    });
    it('whitespace -> if missing', () => {
      expect(mapString('    ', (i) => i.toUpperCase(), -1)).toEqual(-1);
    });
    it('empty -> if missing', () => {
      expect(mapString('', (i) => i.toUpperCase(), -1)).toEqual(-1);
    });
    it('untrimmed regular string -> map', () => {
      expect(mapString('   abc  ', (i) => i.toUpperCase(), -1)).toEqual('ABC');
    });
    it('trimmed regular string -> map', () => {
      expect(mapString('abc', (i) => i.toUpperCase(), -1)).toEqual('ABC');
    });
  });
});
