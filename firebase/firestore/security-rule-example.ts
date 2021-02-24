// ===========================================================================
// This is a super-simple example of how to use this. You can copy and paste
// this entire file along with the imported type definitions into the TypeScript
// playground to see the end result. https://www.typescriptlang.org/play
// ===========================================================================

/* eslint-disable prefer-const */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AnyRequestKind,
  ConvertDataModel,
  CreateRule,
  DeleteRule,
  ReadRule,
  Request,
  Resource,
  StringFire,
  UpdateRule,
} from './security-rule-types';

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
  return request.auth.uid !== null;
}

function isAdministrator() {
  return request.auth.token.isAdministrator === true;
}

function commentIsValid(s: StringFire) {
  return s.trim().size() !== 0;
}

function hasAllRequiredKeys(data: PostModel) {
  let requiredKeys = ['createdOn', 'modifiedOn', 'comment'];
  return data.keys().hasAll(requiredKeys) && data.keys().hasOnly(requiredKeys);
}

// eslint-disable-next-line no-shadow
const CREATE: CreateRule<PostModel, Claims> = (request, resource) =>
  isLoggedIn() &&
  hasAllRequiredKeys(request.resource.data) &&
  resource.data.createdOn === request.time &&
  resource.data.modifiedOn === request.time &&
  resource.data.owner === request.auth.uid &&
  commentIsValid(resource.data.comment);

// eslint-disable-next-line no-shadow
const READ: ReadRule<PostModel, Claims> = (request, resource) => isLoggedIn();

// eslint-disable-next-line no-shadow
const DELETE: DeleteRule<PostModel, Claims> = (request, resource) =>
  isAdministrator() || resource.data.owner === request.auth.uid;

// eslint-disable-next-line no-shadow
const UPDATE: UpdateRule<PostModel, Claims> = (request, resource) =>
  resource.data.modifiedOn === request.time &&
  resource.data.createdOn === request.resource!.data.createdOn && // read only
  resource.data.owner === request.resource!.data.owner && // read only
  hasAllRequiredKeys(request.resource.data) &&
  commentIsValid(resource.data.comment);
