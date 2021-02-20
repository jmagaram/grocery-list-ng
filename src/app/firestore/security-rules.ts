import {
  ConvertDataModel,
  Request,
  Resource,
  AnyRequestKind,
  CreateRule,
  StringFire,
  StringParameter,
} from './security-rule-types';
import { List, ListId } from './data-types';

type ClaimsClient = { memberOf?: ListId };

type Claims = ConvertDataModel<ClaimsClient>;

function isLoggedIn(request: Request<any, Claims, AnyRequestKind>) {
  return request.auth.uid != null;
}

function stringsExactlyEqual(a: StringParameter, b: StringParameter) {
  return ((a as unknown) as string) == ((b as unknown) as string);
}

namespace ListA {
  type Model = ConvertDataModel<List<'read'>>;

  type RequestList<Kind extends AnyRequestKind> = Request<Model, Claims, Kind>;

  type WriteRequestList = RequestList<'create' | 'update'>;

  type ResourceList = Resource<Model>;

  declare const request: RequestList<AnyRequestKind>;

  declare const resource: ResourceList;

  function emailMatchesUserToken(request: WriteRequestList) {
    let tokenHasEmail =
      request.auth.token.keys().hasAny(['email']) &&
      request.auth.token.email != null;
    let dataHasEmail =
      request.resource.data.owner.keys().hasAny(['email']) &&
      request.resource.data.owner.email != null;
    let bothMissingEmail = !tokenHasEmail && !dataHasEmail;
    return (
      bothMissingEmail ||
      (request.resource.data.owner.email!.address == request.auth.token.email &&
        request.resource.data.owner.email!.verified ==
          request.auth.token.email_verified)
    );
  }

  function ownerNameMatchesUserToken(request: WriteRequestList) {
    let tokenHasName =
      request.auth.token.keys().hasAny(['name']) &&
      request.auth.token.name != null;
    let dataHasName =
      request.resource.data.owner.keys().hasAny(['name']) &&
      request.resource.data.owner.name != null;
    let bothMissingName = !tokenHasName && !dataHasName;
    return (
      bothMissingName ||
      request.resource.data.owner.name == request.auth.token.name
    );
  }

  const READ: CreateRule<Model, Claims> = (request, resource) => {
    return (
      resource.data.id == request.auth.uid ||
      request.auth.token.memberOf == resource.id
    );
  };

  // don't understand how nulls vs missing fields are treated
  const CREATE: CreateRule<Model, Claims> = (request, resource) => {
    return (
      request.resource.data.id == request.auth.uid &&
      stringsExactlyEqual(request.resource.data.version, '1') &&
      request.resource.data.createdOn == request.time &&
      request.resource.data.owner.uid == request.auth.uid &&
      emailMatchesUserToken(request) &&
      ownerNameMatchesUserToken(request)
    );
  };

  const UPDATE: CreateRule<Model, Claims> = (request, resource) => {
    return (
      request.resource.data.id == request.auth.uid &&
      stringsExactlyEqual(request.resource.data.version, '1') &&
      request.resource.data.createdOn == resource.data.createdOn &&
      request.resource.data.owner.uid == request.auth.uid &&
      (!('owner' in request.resource.data.diff(resource.data).affectedKeys()) ||
        ownerNameMatchesUserToken(request)) &&
      (!('email' in request.resource.data.diff(resource.data).affectedKeys()) ||
        emailMatchesUserToken(request))
    );
  };

  const DELETE: CreateRule<Model, Claims> = (request, resource) => {
    return false;
  };
}

export {};
