import { from } from 'rxjs';
import { filter, reduce, map } from 'rxjs/operators';
import {
  isNullUndefinedOrWhitespace,
  mapString,
  timeout,
  filterMap,
  exists,
  visibleString,
} from './utilities';

describe('other utilities', () => {
  it('timeout - return the value', async () => {
    const result = await timeout(200, 'abc');
    expect(result).toEqual('abc');
  });

  const maybeToUpperCase = (s: string | null | undefined) =>
    exists(s) ? s.toUpperCase() : -1;

  it('exists type guard - null goes is false', () =>
    expect(maybeToUpperCase(null)).toEqual(-1));

  it('exists type guard - undefined goes is false', () =>
    expect(maybeToUpperCase(undefined)).toEqual(-1));

  it('exists type guard - not null or undefined is true', () =>
    expect(maybeToUpperCase('abc')).toEqual('ABC'));

  it('exists type guard - can use to filter rxjs without eslint errors', async () => {
    const source = from(['a', 'b', null, undefined, 'c', 'd']).pipe(
      filter(exists),
      map((i) => i.toUpperCase()),
      reduce((acc, i) => acc + i)
    );
    const result = await source.toPromise();
    expect(result).toEqual('ABCD');
  });

  it('filterMap - excludes projections to undefined', async () => {
    const convertToStringOrUndefined = (
      item: number | null | undefined
    ): string | undefined =>
      item === null || item === undefined ? undefined : item.toString();
    const source = from([1, 2, null, undefined, 3, 4]).pipe(
      filterMap(convertToStringOrUndefined),
      reduce((acc, i) => acc + i, '')
    );
    const result = await source.toPromise();
    expect(result).toEqual('1234');
  });

  it('filterMap - excludes projections to null', async () => {
    const convertToStringOrNull = (
      item: number | null | undefined
    ): string | null =>
      item === null || item === undefined ? null : item.toString();
    const source = from([1, 2, null, undefined, 3, 4]).pipe(
      filterMap(convertToStringOrNull),
      reduce((acc, i) => acc + i, '')
    );
    const result = await source.toPromise();
    expect(result).toEqual('1234');
  });

  it('filterMap - empty -> empty', async () => {
    const convertToStringOrNull = (
      item: number | null | undefined
    ): string | null =>
      item === null || item === undefined ? null : item.toString();
    const source = from([]).pipe(
      filterMap(convertToStringOrNull),
      reduce((acc, i) => acc + i, '')
    );
    const result = await source.toPromise();
    expect(result).toEqual('');
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

  describe('visibleString', () => {
    it('undefined -> undefined', () => {
      expect(visibleString(undefined)).toBeUndefined();
    });

    it('whitespace -> undefined', () => {
      expect(visibleString('   ')).toBeUndefined();
    });

    it('empty -> undefined', () => {
      expect(visibleString('')).toBeUndefined();
    });

    it('null -> undefined', () => {
      expect(visibleString(null)).toBeUndefined();
    });

    it('string with padding -> string without padding', () => {
      expect(visibleString('   ab c   ')).toEqual('ab c');
    });

    it('string without padding -> original string', () => {
      expect(visibleString('abc')).toEqual('abc');
    });
  });
});
