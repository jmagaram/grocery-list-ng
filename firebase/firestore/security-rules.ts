/* eslint-disable no-var */
/* eslint-disable eqeqeq */
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
    let isOwner = request.auth.uid == resource.data.id;
    let isMember = request.auth.token.memberOf == resource.data.id;
    return isOwner || isMember;
  };

  // TODO: Check invitation
  // eslint-disable-next-line no-shadow
  const createIfHelper: CreateRule<Model, Claims> = (request, resource) => {
    let doc = request.resource.data;
    let auth = request.auth;
    let isOwner = request.auth.uid == doc.id;
    let isVersion1 = ((doc.version as unknown) as string) == '1';
    let createdNow = doc.createdOn == request.time;
    let ownerIdMatches = doc.owner.uid == request.auth.uid;
    let ownerNameMatches =
      doc.get(-1, (i) => i.owner.name) == auth.get(-1, (i) => i.token.name);
    let ownerEmailAddressMatches =
      doc.get(-1, (i) => i.owner.email) == auth.get(-1, (i) => i.token.email);
    let ownerEmailVerifiedMatches =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      doc.get(-1, (i) => i.owner.email!.verified) ==
      auth.get(-1, (i) => i.token.email_verified);
    let membersEmpty = doc.members.size() == 0;
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

  const create: CreateRule<Model, Claims> = (request, resource) =>
    createIfHelper(request, resource);

  const read: ReadRule<Model, Claims> = (request, resource) =>
    readIfHelper(request, resource);

  // Allow through cloud function or another approach
  // eslint-disable-next-line no-shadow
  const update: UpdateRule<Model, Claims> = (request, resource) => false;

  // Allow through cloud function or another approach
  // eslint-disable-next-line no-shadow
  const deleteIf: DeleteRule<Model, Claims> = (request, resource) => false;
}

// MATCH /invitation/{invitationId}
namespace Invitation {
  type Model = MapFire<Invitation<'read'>>;

  const isPasswordValid = (p: StringFire): boolean =>
    (p as StringFireMethods).matches('^\\w{3,}$');

  const emailMatchesAuth: CreateUpdateRule<Model, Claims> = (
    request,
    resource
  ) => {
    return (
      // TODO Fails when fields are missing; use type-safe Get method instead
      request.auth.token.email == request.resource.data.owner.email &&
      request.auth.token.email_verified ==
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        request.resource.data.owner.email!.verified
    );
  };

  // TODO Probably buggy
  // TODO Can't import namespace duration properly
  const isExpired: ReadRule<Model, Claims> = (request, resource) => {
    let nowSeconds = request.time.toMillis() / 1000;
    let inviteCreated = resource.data.createdOn.toMillis() / 1000;
    let ageSeconds = nowSeconds - inviteCreated;
    let maxAge = duration.value(2, 'w').seconds();
    return ageSeconds <= maxAge;
  };

  const update: UpdateRule<Model, Claims> = (request, resource) =>
    ((request.resource.data.version as unknown) as string) == '1' &&
    isPasswordValid(request.resource.data.password) &&
    emailMatchesAuth(request, resource);

  const deleteIf: DeleteRule<Model, Claims> = (request, resource) =>
    resource.data.id == request.auth.uid;

  const read: ReadRule<Model, Claims> = (request, resource) =>
    !isExpired(request, resource);
}

export {};
