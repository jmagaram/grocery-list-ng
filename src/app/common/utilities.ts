import { EMPTY, OperatorFunction, from as obsFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export function* range(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

export const isNullUndefinedOrWhitespace = (
  s: string | undefined | null
): boolean => s === undefined || s === null || s.trim() === '';

export const mapString = <T, U>(
  s: string | undefined | null,
  map: (trimmed: string) => T,
  ifNullUndefinedOrWhitespace: U
): T | U => {
  if (s === undefined || s === null) {
    return ifNullUndefinedOrWhitespace;
  } else {
    const normalized = s.trim();
    return normalized === '' ? ifNullUndefinedOrWhitespace : map(normalized);
  }
};

export const visibleString = (s: string | undefined | null) =>
  mapString(s, (i) => i, undefined);

export const timeout = <T>(ms: number, value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export const exists = <T>(
  value: T | undefined | null
): value is Exclude<T, null | undefined> =>
  value !== undefined && value !== null;

// An observable operator that applies the chooser to each element and passes
// the result through if it is not null or undefined. Inspired by the useful F#
// 'choose' operators on sequences, lists, and arrays.
export const filterMap = <T, U>(
  chooser: (item: T) => U | undefined | null
): OperatorFunction<T, U> =>
  mergeMap((i) => {
    const r = chooser(i);
    if (r === null || r === undefined) {
      return EMPTY;
    } else {
      return obsFrom([r]);
    }
  });
