// ===========================================================================
// This is a super-simple example of how to use this. You can copy and paste
// this entire file along with the imported type definitions into the TypeScript
// playground to see the end result. https://www.typescriptlang.org/play
// ===========================================================================

/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-shadow */

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

  const create: CreateRule<PostModel, Claims> = (request, resource) =>
    isLoggedIn() &&
    hasAllRequiredKeys(request.resource.data) &&
    resource.data.createdOn === request.time &&
    resource.data.modifiedOn === request.time &&
    resource.data.owner === request.auth.uid &&
    commentIsValid(resource.data.comment);

  const read: ReadRule<PostModel, Claims, 'noparams'> = () => isLoggedIn();

  const deleteIf: DeleteRule<PostModel, Claims> = (request, resource) =>
    isAdministrator() || resource.data.owner === request.auth.uid;

  const update: UpdateRule<PostModel, Claims> = (request, resource) =>
    resource.data.modifiedOn === request.time &&
    resource.data.createdOn === request.resource!.data.createdOn && // read only
    resource.data.owner === request.resource!.data.owner && // read only
    hasAllRequiredKeys(request.resource.data) &&
    commentIsValid(resource.data.comment);
}
