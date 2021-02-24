/* eslint-disable prefer-const */

import {
  ConvertDataModel,
  Request,
  Resource,
  AnyRequestKind,
  CreateRule,
} from './security-rule-types';
import {
  GroceryList,
  Claims as ClaimsClient,
} from '../../src/app/firestore/data-types';

type Claims = ConvertDataModel<ClaimsClient>;

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ShoppingListRules {
  type Model = ConvertDataModel<GroceryList<'read'>>;

  type RequestList<Kind extends AnyRequestKind> = Request<Model, Claims, Kind>;

  type WriteRequestList = RequestList<'create' | 'update'>;

  type ResourceList = Resource<Model>;

  declare const request: RequestList<AnyRequestKind>;

  declare const resource: ResourceList;

  // eslint-disable-next-line no-shadow
  const READ: CreateRule<Model, Claims> = (request, resource) => {
    let isOwner = request.auth.uid === resource.data.id;
    let isMember = request.auth.token.memberOf === resource.id;
    return isOwner || isMember;
  };

  // TODO: Fix the auth to be a proper Map that validates field names.
  // TODO: Fix get function type in general; not working
  // TODO: Check invitation
  // TODO: Find out of optional token fields, like name, are null or missing.
  // eslint-disable-next-line no-shadow
  const CREATE: CreateRule<Model, Claims> = (request, resource) => {
    let doc = request.resource.data;
    let auth = request.auth;
    let isOwner = request.auth.uid === doc.id;
    let isVersion1 = ((doc.version as unknown) as string) === '1';
    let createdNow = doc.createdOn === request.time;
    let ownerIdMatches = doc.owner.uid === request.auth.uid;
    let ownerNameMatches =
      (doc as any).get(['owner', 'name'], -1) ===
      (auth.token as any).get('name', -1);
    let ownerEmailAddressMatches =
      (doc as any).get(['owner', 'email', 'address'], -1) ===
      (auth.token as any).get('email', -1);
    let ownerEmailVerifiedMatches =
      (doc as any).get(['owner', 'email', 'verified'], -1) ===
      (auth.token as any).get('email_verified', -1);
    let membersEmpty = doc.members.size() === 0;
    return (
      isOwner &&
      isVersion1 &&
      createdNow &&
      ownerIdMatches &&
      ownerNameMatches &&
      ownerEmailAddressMatches &&
      ownerEmailVerifiedMatches &&
      membersEmpty
    );
  };

  // Allow through cloud function or another approach
  // eslint-disable-next-line no-shadow
  const UPDATE: CreateRule<Model, Claims> = (request, resource) => false;

  // Allow through cloud function or another approach
  // eslint-disable-next-line no-shadow
  const DELETE: CreateRule<Model, Claims> = (request, resource) => false;
}

export {};
