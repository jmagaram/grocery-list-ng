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
}

export interface Duration {
  _kind: 'Duration';
  nanos(): number;
  seconds(): number;
}

export type StringLiteral = string;

export type StringParameter = StringLiteral | StringFire;

export interface StringFire {
  _kind: 'String';
  matches: (pattern: StringParameter) => boolean;
  lower: () => StringFire;
  upper: () => StringFire;
  trim: () => StringFire;
  size: () => number;
  replace: (regex: StringParameter, sub: StringParameter) => StringFire;
  split: (regex: StringParameter) => ListFire<StringFire>;
}

export type LiteralPrimitive<T> = T extends StringFire ? string : never;

export type LiteralList<T> = (LiteralPrimitive<T> | T)[];

export type ListParameter<T> = ListFire<T> | LiteralList<T>;

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

// BUGGY Don't have time to get into this right now. I've gotten a bit confused
// here about whether the type T is the types of properties within the object or
// the root object itself. Also not sure this type can be defined in any way
// other than recursively. Look at relationship between this type and
// ConvertDataModel defined below. Some work need to be done to ensure values()
// returns just the correct types of values and keys() returns just the correct
// types of keys.
export interface MapFire<T extends Record<string, unknown>> {
  _kind: 'Map';
  keys: () => ListFire<StringFire>;
  size: () => number;
  values: () => ListFire<T>;
  diff: (other: MapFire<T>) => MapDiff;
  get: <U, MODE extends 'deep' | 'shallow' = 'shallow'>(
    key: MODE extends 'shallow'
      ? StringFire | PropertyNames<T, 'shallow'>
      : (StringFire | PropertyNames<T, 'deep'>)[],
    defaultValue: U
  ) => MODE extends 'shallow'
    ? PropertyTypes<T, 'shallow'> | U
    : PropertyTypes<T, 'deep'> | U;
}

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
  hasAny: (s: SetFire<T> | ListFire<T> | LiteralList<T>) => boolean;
  hasOnly: (s: SetFire<T> | ListFire<T> | LiteralList<T>) => boolean;
  hasAll: (s: SetFire<T> | ListFire<T> | LiteralList<T>) => boolean;
  intersection: (s: SetFire<T> | ListFire<T> | LiteralList<T>) => SetFire<T>;
  difference: (s: SetFire<T> | LiteralList<T>) => SetFire<T>;
  union: (s: SetFire<T> | LiteralList<T>) => SetFire<T>;
}

export declare function int<T extends StringParameter | number>(
  value: T
): number;
export declare function float<T extends StringParameter | number>(
  value: T
): number;

export declare function debug<T>(value: T): T;

export declare function get<DATA>(path: string): Resource<DATA> | undefined;

export declare function exists(path: string): boolean;

// eslint-disable-next-line @typescript-eslint/no-namespace
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

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace timestamp {
  function date(year: number, month: number, day: number): Timestamp;
  function value(epochMillis: number): Timestamp;
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

export interface Auth<CLAIMS> {
  uid: StringFire;
  token: Token & CLAIMS;
}

export interface Token {
  name?: StringFire;
  email?: StringFire;
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
  id: StringFire;
}

export type ReadRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, ReadRequest>,
  resource: Resource<DATA>
) => boolean;

export type ListRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, 'list'>,
  resource: Resource<DATA>
) => boolean;

export type GetRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, 'get'>,
  resource: Resource<DATA>
) => boolean;

export type WriteRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, WriteRequest>,
  resource: Resource<DATA>
) => boolean;

export type CreateRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, 'create'>,
  resource: Resource<DATA>
) => boolean;

export type UpdateRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, 'update'>,
  resource: Resource<DATA>
) => boolean;

export type CreateUpdateRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, 'create' | 'update'>,
  resource: Resource<DATA>
) => boolean;

export type DeleteRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, 'delete'>,
  resource: Resource<DATA>
) => boolean;

export type UtilityFunction<
  DATA,
  CLAIMS,
  T = undefined,
  METHOD extends AnyRequestKind = AnyRequestKind
> = (
  request: Request<DATA, CLAIMS, AnyRequestKind>,
  resource: Resource<DATA>,
  item?: T
) => boolean;

type AnyFunc = (...args: any[]) => any;

// Takes a TypeScript data model defined for the client and converts it to a
// model that uses rules-engine specific types. For example, it converts every
// instance of an {...} object into a Map with methods for diff, size, etc... If
// you don't like this mapping, create your own or author the server-side data
// model yourself using other types defined in this module.
export type ConvertDataModel<T> = T extends string
  ? StringFire
  : T extends Date
  ? Timestamp
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends AnyFunc
  ? never
  : T extends Array<infer V>
  ? ListFire<ConvertDataModel<V>>
  : T extends { [K in keyof T]: infer V }
  ? { readonly [K in keyof T]: ConvertDataModel<T[K]> } & MapFire<T>
  : never;

// Given an object { } - not an array, function, or primitive - generates a type
// that encompasses the valid property names within that type, excluding
// properties that refer to methods.
type PropertyNames<
  T extends Record<string, unknown>,
  M extends 'deep' | 'shallow'
> = {
  [KEY in keyof T & (string | number)]: T[KEY] extends Record<string, unknown>
    ? KEY | (M extends 'deep' ? PropertyNames<T[KEY], M> : never)
    : T[KEY] extends AnyFunc
    ? never
    : KEY;
}[keyof T & (string | number)];

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

// Given an object { } - not an array, function, or primitive - generates a type
// that encompasses the types of all properties within that type, excluding
// properties that refer to functions.
type PropertyTypes<
  T extends Record<string, unknown>,
  MODE extends 'deep' | 'shallow'
> = Exclude<PropertyTypesCore<T, MODE>, AnyFunc>;
