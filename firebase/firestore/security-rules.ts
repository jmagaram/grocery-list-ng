/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable arrow-body-style */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable prefer-const */

import {
  MapFire,
  Request,
  Resource,
  AnyRequestKind,
  CreateRule,
  UpdateRule,
  DeleteRule,
  ReadRule,
  CreateUpdateRule,
  StringFireMethods,
  StringFire,
  duration as durationNamespace,
  ListRule,
  GetRule,
} from './security-rule-types';
import {
  GroceryList,
  Claims as ClaimsClient,
  Invitation,
} from '../../src/app/firestore/data-types';

let duration = durationNamespace; // OMIT

type Claims = MapFire<ClaimsClient>;

// MATCH /animal/{animalId}
namespace Animals {
  const read: CreateRule<any, any> = (request, resource) => true;
  const write: CreateRule<any, any> = (request, resource) => true;
}

// MATCH /grocerylist/{grocerylistid}
namespace ShoppingListRules {
  type Model = MapFire<GroceryList<'read'>>;

  type RequestList<Kind extends AnyRequestKind> = Request<Model, Claims, Kind>;

  type WriteRequestList = RequestList<'create' | 'update'>;

  type ResourceList = Resource<Model>;

  const readIfHelper: ReadRule<Model, Claims> = (request, resource) => {
    let isOwner = request.auth.uid === resource.data.id;
    let isMember = request.auth.token.memberOf === resource.data.id;
    return isOwner || isMember;
  };

  // TODO: Check invitation
  // eslint-disable-next-line no-shadow
  const createIfHelper: CreateRule<Model, Claims, 'request'> = (request) => {
    let doc = request.resource.data;
    let auth = request.auth;
    let isOwner = auth.uid === doc.id;
    let isVersion1 = ((doc.version as unknown) as string) === '1';
    let createdNow = doc.createdOn === request.time;
    let ownerIdMatches = doc.owner.uid === auth.uid;
    let ownerNameMatches =
      doc.get(-1, (i) => i.owner.name) === auth.get(-1, (i) => i.token.name);
    let ownerEmailAddressMatches =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      doc.get(-1, (i) => i.owner.email!.address) ===
      auth.get(-1, (i) => i.token.email);
    let ownerEmailVerifiedMatches =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      doc.get(-1, (i) => i.owner.email!.verified) ===
      auth.get(-1, (i) => i.token.email_verified);
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

  const create: CreateRule<Model, Claims, 'request'> = (request) =>
    createIfHelper(request);

  const read: ReadRule<Model, Claims> = (request, resource) =>
    readIfHelper(request, resource);

  // Allow through cloud function or another approach
  // eslint-disable-next-line no-shadow
  const update: UpdateRule<Model, Claims, 'noparams'> = () => false;

  // Allow through cloud function or another approach
  // eslint-disable-next-line no-shadow
  const deleteIf: DeleteRule<Model, Claims, 'noparams'> = () => false;
}

// MATCH /invitation/{invitationId}
// TODO Validate password
namespace Invitation {
  type Model = MapFire<Invitation<'read'>>;

  const create: CreateRule<Model, Claims> = (request, resource) =>
    request.auth !== null &&
    request.resource.data.owner.uid === request.auth.uid &&
    request.resource.data.version === '1' &&
    request.resource.data.createdOn === request.time &&
    request.resource.data.get(-1, (i) => i.owner.email!.address) ===
      request.auth.get(-1, (j) => j.token.email) &&
    request.resource.data.get(-1, (i) => i.owner.email!.verified) ===
      request.auth.get(-1, (j) => j.token.email_verified) &&
    request.resource.data.get(-1, (i) => i.owner.name) ===
      request.auth.get(-1, (j) => j.token.name);

  const update: UpdateRule<Model, Claims> = (request, resource) => false;

  const deleteIf: DeleteRule<Model, Claims> = (request, resource) =>
    request.auth.uid === resource.data.owner.uid;

  const list: ListRule<Model, Claims> = (request, resource) =>
    request.auth.uid === resource.data.owner.uid;

  const get: GetRule<Model, Claims> = (request, resource) =>
    request.auth !== null &&
    request.auth.token.firebase.sign_in_provider !== 'anonymous';
}

export {};
