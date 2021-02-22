export function* range(start: number, end: number) {
  let iterationCount = 0;
  for (let i = start; i <= end; i++) {
    yield i;
  }
  return iterationCount;
}
