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
// ISSUES WITH THIS APPROACH: Optional chaining isn't supported. So this makes
// navigating your models using standard TypeScript, like model?.member?.email,
// really cumbersome. Instead you need to write these types of expressions using
// the get operator, which isn't type-safe, and defeats a lot of the benefit.
// ===========================================================================

// ===========================================================================
// This is a super-simple example of how to use this. You can copy and paste
// this entire file into the TypeScript playground to see the end result.
// https://www.typescriptlang.org/play
// ===========================================================================

namespace SimpleExample {
  type UserId = string;

  type Post = {
    id: string;
    createdOn: Date;
    modifiedOn: Date;
    owner: UserId;
    comment: string;
  };

  type Claims = {
    isAdministrator: boolean;
  };

  type PostModel = ConvertDataModel<Post>;

  type PostRequest<Kind = AnyRequestKind> = Request<
    PostModel,
    Claims,
    AnyRequestKind
  >;

  type PostResource = Resource<PostModel>;

  declare const request: PostRequest;

  declare const resource: PostResource;

  function isLoggedIn() {
    return request.auth.uid != null;
  }

  function isAdministrator() {
    return request.auth.token.isAdministrator == true;
  }

  function commentIsValid(s: StringFire) {
    return s.trim().size() != 0;
  }

  function hasAllRequiredKeys(data: PostModel) {
    let requiredKeys = ['createdOn', 'modifiedOn', 'comment'];
    return (
      data.keys().hasAll(requiredKeys) && data.keys().hasOnly(requiredKeys)
    );
  }

  const CREATE: CreateRule<PostModel, Claims> = (request, resource) =>
    isLoggedIn() &&
    hasAllRequiredKeys(request.resource.data) &&
    resource.data.createdOn == request.time &&
    resource.data.modifiedOn == request.time &&
    resource.data.owner == request.auth.uid &&
    commentIsValid(resource.data.comment);

  const READ: ReadRule<PostModel, Claims> = (request, resource) => isLoggedIn();

  const DELETE: DeleteRule<PostModel, Claims> = (request, resource) =>
    isAdministrator() || resource.data.owner == request.auth.uid;

  const UPDATE: UpdateRule<PostModel, Claims> = (request, resource) =>
    resource.data.modifiedOn == request.time &&
    resource.data.createdOn == request.resource!.data.createdOn && // read only
    resource.data.owner == request.resource!.data.owner && // read only
    hasAllRequiredKeys(request.resource.data) &&
    commentIsValid(resource.data.comment);
}

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
  matches: (pattern: StringParameter) => Boolean;
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
export interface MapFire<T extends object> {
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
  email_verified: boolean;
  firebase: { sign_in_provider: SignInProvider };
}

export interface Request<DATA, CLAIMS, METHOD extends AnyRequestKind> {
  auth: Auth<CLAIMS>;
  resource: { data: METHOD extends WriteRequest ? DATA : undefined };
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

export type DeleteRule<DATA, CLAIMS> = (
  request: Request<DATA, CLAIMS, 'delete'>,
  resource: Resource<DATA>
) => boolean;

export type UtilityFunction<
  DATA,
  CLAIMS,
  T = undefined,
  METHOD = AnyRequestKind
> = (
  request: Request<DATA, CLAIMS, AnyRequestKind>,
  resource: Resource<DATA>,
  item?: T
) => boolean;

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
  : T extends Function
  ? never
  : T extends Array<infer V>
  ? ListFire<ConvertDataModel<V>>
  : T extends { [K in keyof T]: infer V }
  ? { readonly [K in keyof T]: ConvertDataModel<T[K]> } & MapFire<T>
  : never;

// Generates a type that encompasses all the valid property names for another type.
type PropertyNames<T extends object, M extends 'deep' | 'shallow'> = {
  [TKey in keyof T & (string | number)]: T[TKey] extends Function
    ? never
    : T[TKey] extends object
    ? TKey | (M extends 'deep' ? PropertyNames<T[TKey], M> : never)
    : TKey;
}[keyof T & (string | number)];

// Generates a type that encompasses all the valid property values for another type.
type PropertyTypes<T extends object, M extends 'deep' | 'shallow'> = {
  [TKey in keyof T & (string | number)]: T[TKey] extends Function
    ? never
    : T[TKey] extends object
    ? T[TKey] | (M extends 'deep' ? PropertyTypes<T[TKey], M> : never)
    : T[TKey];
}[keyof T & (string | number)];
