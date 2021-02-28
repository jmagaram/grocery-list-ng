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

export const timeout = <T>(ms: number, value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
