import { from } from 'rxjs';
import { reduce } from 'rxjs/operators';
import {
  isNullUndefinedOrWhitespace,
  mapString,
  timeout,
  filterMap,
} from './utilities';

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
});
