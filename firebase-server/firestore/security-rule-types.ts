/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/ban-types */

// ===========================================================================
// This file defines types and functions used within the Firebase security rules
// engine. You can author your rules in a limited version of TypeScript using
// these types in a friendly code editor like VS Code and get compile-time
// checking, intellisense, and other productivity features.
//
// The rules engine language is not javascript. You can't use optional chaining,
// if-then statements, define functions that return anything but null, use
// anonymous functions, etc. So this is all only useful if you are careful and
// still to bare-bones javascript.
//
// https://firebase.google.com/docs/rules/rules-language
// https://firebase.google.com/docs/reference/rules/rules.
//
// This file is not a complete list of every type and function supported on the
// server.
//
// TO USE:
//
// (1) Author your data models in TypeScript. (2) Convert the model to a
// server-compatible version. This can be done automatically with TypeScript
// conditional and mapped types. See end of this file for an example. (3) Import
// all the types defined here in your rules .ts and code them up in TypeScript
// (with restrictions) in a good code editor. (4) Compile your code to
// javascript. (5) Paste relevant code into the rules file or Fireward.
//
// MORE NOTES FOR CODING SECURITY RULES:
//
// Javascript on the server is not the same as the client. Avoid if-then
// statements, loops, functions that return anything but a boolean, arrow
// functions, and optional chaining. The list range operator [i:j], can't be
// coded here. If the TypeScript compiler complains about type errors you can do
// an unsafe cast like "X as unknown as number"; this is erased when transpiled
// to javascript. Do not use the ?. operator; use the !. operator instead.
//
// ISSUES WITH THIS APPROACH:
//
// Optional chaining isn't supported. So this makes navigating your models using
// standard TypeScript, like model?.member?.email, really cumbersome. Instead
// you need to write these types of expressions using the get operator, which
// isn't type-safe, and defeats a lot of the benefit.
//
// The types defined on the server have completely unusable names; intellisense
// doesn't make them readable because they are much too long. This is because
// the types are generated automatically as a mapping of the friendly
// client-type rules.
//
// Don't yet know how to make a literal StringFire; useful to verify the version
// number of a document is "1" for example.
// ===========================================================================

export interface Timestamp {
  _kind: 'Timestamp';
  date(): Timestamp;
  hours(): number;
  minutes(): number;
  seconds(): number;
  nanos(): number;
  time(): Duration;
  year(): number;
  month(): number;
  day(): number;
  toMillis(): number;
}

export interface Duration {
  _kind: 'Duration';
  nanos(): number;
  seconds(): number;
}

// TODO One challenge of working with strings is that the built-in javascript
// string methods are not supported inside the rules engine and programmers
// could accidentally use them and not get any compile-time errors. So it is
// safest to make a different string type that just has the supported methods.
// But it is tricky to get this custom type to play nice with string literals
// like "abc" without a lot of awkward casting. One approach is to use an
// intersection type that is the standard string & the custom methods and have a
// custom eslint plug in to warn when invalid methods are being used.

// A regular javascript string except that the standard methods, like
// 'toLowerCase', are stripped so they won't accidentally be used when writing
// security rules.
export type StrippedString = Omit<Omit<string, MethodNames<String>>, 'length'>;

// These are the functions that the string type supports in the rules engine.
export interface StringFireMethods {
  _kind: 'String';
  matches: (pattern: StringParameter) => boolean;
  lower: () => StringFire;
  upper: () => StringFire;
  trim: () => StringFire;
  size: () => number;
  replace: (regex: StringParameter, sub: StringParameter) => StringFire;
  split: (regex: StringParameter) => ListFire<StringFire>;
}

// Used by rules engine methods that return a string. Although union types are
// somewhat useless in the rules engine - can't make use of type guards - they
// can be compared to string literals which is nice.
export type StringFire = StrippedString | StringFireMethods;

// Use wherever a function expects string input.
export type StringParameter = string | StringFire;

export type ListParameter<T> = ListFire<T> | T[];

export type ListFire<T> = {
  _kind: 'List';
  hasAny: (i: ListParameter<T>) => boolean;
  hasOnly: (i: ListParameter<T>) => boolean;
  hasAll: (i: ListParameter<T>) => boolean;
  concat: (i: ListParameter<T>) => ListFire<T>;
  removeAll: (i: ListParameter<T>) => ListFire<T>;
  join: (separator: StringParameter) => StringFire;
  size: () => number;
  toSet: () => SetFire<T>;
} & { readonly [index: number]: T };

// Takes a TypeScript data model defined for the client and converts it to a
// model that uses rules-engine specific types. For example, it converts every
// instance of an {...} object into a Map with methods for diff, size, etc...
export type MapFire<T> = T extends string
  ? StringFire
  : T extends Date
  ? Timestamp
  : T extends number | boolean
  ? T
  : T extends AnyFunction
  ? never
  : T extends Array<infer V>
  ? ListFire<MapFire<V>>
  : T extends object
  ? {
      [K in keyof T]: MapFire<T[K]>;
    } & {
      _kind: 'Map';
      keys: () => ListFire<MapFire<PropertyNames<T>>>;
      size: () => number;
      diff: (other: MapFire<T>) => MapDiff;
      values: () => ListFire<any>; // Don't know how to strongly-type this
      get: <X, U>(otherwise: X, path: (start: T) => U) => U | X;
    }
  : never;

export interface MapDiff {
  _kind: 'MapDiff';
  addedKeys: () => SetFire<StringFire>;
  affectedKeys: () => SetFire<StringFire>;
  changedKeys: () => SetFire<StringFire>;
  removedKeys: () => SetFire<StringFire>;
  unchangedKeys: () => SetFire<StringFire>;
}

export interface SetFire<T> {
  _kind: 'Set';
  size: () => number;
  hasAny: (s: SetFire<T> | ListParameter<T>) => boolean;
  hasOnly: (s: SetFire<T> | ListParameter<T>) => boolean;
  hasAll: (s: SetFire<T> | ListParameter<T>) => boolean;
  intersection: (s: SetFire<T>) => SetFire<T>;
  difference: (s: SetFire<T>) => SetFire<T>;
  union: (s: SetFire<T>) => SetFire<T>;
}

export declare function int<T extends StringParameter | number>(
  value: T
): number;
export declare function float<T extends StringParameter | number>(
  value: T
): number;

export declare function debug<T>(value: T): T;

// TODO Support the Path type properly
export declare function get<DATA>(path: string): Resource<DATA> | undefined;
export declare function exists(path: string): boolean;

export declare namespace math {
  function abs(n: number): number;
  function ceil(n: number): number;
  function floor(n: number): number;
  function round(n: number): number;
  function sqrt(n: number): number;
  function isInfinite(n: number): boolean;
  function isNaN(n: number): boolean;
  function pow(base: number, exponent: number): boolean;
}

export declare namespace timestamp {
  function date(year: number, month: number, day: number): Timestamp;
  function value(epochMillis: number): Timestamp;
}

export declare namespace duration {
  function abs(d: Duration): Duration;
  function value(
    n: number,
    unit: 'w' | 'd' | 'h' | 'm' | 's' | 'ms' | 'ns'
  ): Duration;
  function time(
    hours: number,
    mins: number,
    secs: number,
    nanos: number
  ): Duration;
}

export type ReadRequest = 'get' | 'list';
export type WriteRequest = 'create' | 'update' | 'delete';
export type AnyRequestKind = ReadRequest | WriteRequest;

export type SignInProvider =
  | 'custom'
  | 'password'
  | 'phone'
  | 'anonymous'
  | 'google.com'
  | 'facebook.com'
  | 'github.com'
  | 'twitter.com';

export type Auth<CLAIMS> = MapFire<{
  uid: string;
  token: Token & CLAIMS;
}>;

export interface Token {
  name?: string; // TODO Check if underfined or null
  email?: string; // TODO Check if underfined or null
  // eslint-disable-next-line @typescript-eslint/naming-convention
  email_verified: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  firebase: { sign_in_provider: SignInProvider };
}

export interface Request<DATA, CLAIMS, METHOD extends AnyRequestKind> {
  auth: Auth<CLAIMS>;
  resource: METHOD extends 'delete' ? undefined : { data: DATA };
  method: METHOD;
  time: Timestamp;
}

export interface Resource<DATA> {
  data: DATA;
  id: string;
}

type PARAMS = 'request' | 'resource' | 'both' | 'noparams';

type UtilityFunction<
  DATA,
  CLAIMS,
  METHOD extends AnyRequestKind,
  P extends PARAMS
> = P extends 'both'
  ? (
      request: Request<DATA, CLAIMS, METHOD>,
      resource: Resource<DATA>
    ) => boolean
  : P extends 'request'
  ? (request: Request<DATA, CLAIMS, METHOD>) => boolean
  : P extends 'resource'
  ? (resource: Resource<DATA>) => boolean
  : P extends 'noparams'
  ? () => boolean
  : never;

export type ReadRule<DATA, CLAIMS, P extends PARAMS = 'both'> = UtilityFunction<
  DATA,
  CLAIMS,
  ReadRequest,
  P
>;

export type ListRule<DATA, CLAIMS, P extends PARAMS = 'both'> = UtilityFunction<
  DATA,
  CLAIMS,
  'list',
  P
>;

export type GetRule<DATA, CLAIMS, P extends PARAMS = 'both'> = UtilityFunction<
  DATA,
  CLAIMS,
  'get',
  P
>;

export type WriteRule<
  DATA,
  CLAIMS,
  P extends PARAMS = 'both'
> = UtilityFunction<DATA, CLAIMS, WriteRequest, P>;

export type CreateRule<
  DATA,
  CLAIMS,
  P extends PARAMS = 'both'
> = UtilityFunction<DATA, CLAIMS, 'create', P>;

export type UpdateRule<
  DATA,
  CLAIMS,
  P extends PARAMS = 'both'
> = UtilityFunction<DATA, CLAIMS, 'update', P>;

export type CreateUpdateRule<
  DATA,
  CLAIMS,
  P extends PARAMS = 'both'
> = UtilityFunction<DATA, CLAIMS, 'create' | 'update', P>;

export type DeleteRule<
  DATA,
  CLAIMS,
  P extends PARAMS = 'both'
> = UtilityFunction<DATA, CLAIMS, 'delete', P>;

type AnyFunction = (...args: any[]) => any;

// Given an object { } - not an array, function, or primitive - generates a type
// that encompasses the valid method names within that type. Can be used to
// strip methods off built-in javascript primitives, like string, so they are
// not accidentally used when creating security rules. Code from
// https://tinyurl.com/y7rz357h
type MethodNames<T> = T extends object
  ? {
      [K in keyof T]-?: T[K] extends AnyFunction ? K : never;
    }[keyof T]
  : never;

// Given an object { } - not an array, function, or primitive - generates a type
// that encompasses the valid property names within that type, excluding
// properties that refer to methods.
// Code from https://tinyurl.com/y7rz357h
type PropertyNames<T> = T extends object
  ? {
      [K in keyof T]-?: T[K] extends AnyFunction ? never : K;
    }[keyof T]
  : never;

// Given an object { } - not an array, function, or primitive - generates a type
// that encompasses the types of all properties within that type, excluding
// properties that refer to functions.
type PropertyTypes<
  T extends Record<string, unknown>,
  MODE extends 'deep' | 'shallow'
> = Exclude<PropertyTypesCore<T, MODE>, AnyFunction>;

type PropertyTypesCore<
  T extends Record<string, unknown>,
  MODE extends 'deep' | 'shallow'
> = {
  [KEY in keyof T & (string | number)]:
    | T[KEY]
    | (MODE extends 'deep'
        ? T[KEY] extends Record<string, unknown>
          ? PropertyTypesCore<T[KEY], 'deep'>
          : never
        : never);
}[keyof T & (string | number)];
