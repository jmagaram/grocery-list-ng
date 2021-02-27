// ===========================================================================
// This is a super-simple example of how to use this. You can copy and paste
// this entire file along with the imported type definitions into the TypeScript
// playground to see the end result. https://www.typescriptlang.org/play
// ===========================================================================

/* eslint-disable prefer-const */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */

import {
  AnyRequestKind,
  MapFire,
  CreateRule,
  DeleteRule,
  ReadRule,
  Request,
  Resource,
  StringFireMethods,
  UpdateRule,
  StrippedString,
  StringParameter,
  StringFire,
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

type PostModel = MapFire<Post>;

type PostRequest = Request<PostModel, Claims, AnyRequestKind>;

type PostResource = Resource<PostModel>;

declare const request: PostRequest;

declare const resource: PostResource;

// MATCH /sample/{id}
namespace Sample {
  function isLoggedIn() {
    return request.auth.uid !== null;
  }

  function isAdministrator() {
    return request.auth.token.isAdministrator === true;
  }

  function commentIsValid(s: StringFire) {
    return (s as StringFireMethods).trim() !== '';
  }

  function hasAllRequiredKeys(data: PostModel) {
    let requiredKeys = ['createdOn', 'modifiedOn', 'comment'];
    return (
      data.keys().hasAll(requiredKeys) && data.keys().hasOnly(requiredKeys)
    );
  }

  // eslint-disable-next-line no-shadow
  const create: CreateRule<PostModel, Claims> = (request, resource) =>
    isLoggedIn() &&
    hasAllRequiredKeys(request.resource.data) &&
    resource.data.createdOn === request.time &&
    resource.data.modifiedOn === request.time &&
    resource.data.owner === request.auth.uid &&
    commentIsValid(resource.data.comment);

  // eslint-disable-next-line no-shadow
  const read: ReadRule<PostModel, Claims> = (request, resource) => isLoggedIn();

  // eslint-disable-next-line no-shadow
  const deleteIf: DeleteRule<PostModel, Claims> = (request, resource) =>
    isAdministrator() || resource.data.owner === request.auth.uid;

  // eslint-disable-next-line no-shadow
  const update: UpdateRule<PostModel, Claims> = (request, resource) =>
    resource.data.modifiedOn === request.time &&
    resource.data.createdOn === request.resource!.data.createdOn && // read only
    resource.data.owner === request.resource!.data.owner && // read only
    hasAllRequiredKeys(request.resource.data) &&
    commentIsValid(resource.data.comment);
}
