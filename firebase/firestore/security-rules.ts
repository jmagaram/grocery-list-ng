/* eslint-disable no-var */
/* eslint-disable eqeqeq */
/* eslint-disable arrow-body-style */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable prefer-const */

import {
  ConvertDataModel,
  Request,
  Resource,
  AnyRequestKind,
  CreateRule,
  UpdateRule,
  DeleteRule,
  ReadRule,
  UtilityFunction,
  ReadRequest,
  CreateUpdateRule,
  StringFire,
} from './security-rule-types';
import {
  GroceryList,
  Claims as ClaimsClient,
  OpenInvitation,
  Invitation,
} from '../../src/app/firestore/data-types';

type Claims = ConvertDataModel<ClaimsClient>;

// MATCH /animal/{animalId}
namespace Animals {
  const read: CreateRule<any, any> = (request, resource) => true;
  const write: CreateRule<any, any> = (request, resource) => true;
}

// MATCH /grocerylist/{grocerylistid}
namespace ShoppingListRules {
  type Model = ConvertDataModel<GroceryList<'read'>>;

  type RequestList<Kind extends AnyRequestKind> = Request<Model, Claims, Kind>;

  type WriteRequestList = RequestList<'create' | 'update'>;

  type ResourceList = Resource<Model>;

  const somevariable = 'abc'; // OMIT
  let othervariable = 'abd'; // OMIT
  var vfff = 'afe'; // OMIT

  // eslint-disable-next-line no-shadow
  const readIfHelper: ReadRule<Model, Claims> = (request, resource) => {
    let isOwner = request.auth.uid == resource.data.id;
    let isMember = request.auth.token.memberOf == resource.id;
    return isOwner || isMember;
  };

  // TODO: Fix the auth to be a proper Map that validates field names.
  // TODO: Fix get function type in general; not working
  // TODO: Check invitation
  // TODO: Find out of optional token fields, like name, are null or missing.
  // eslint-disable-next-line no-shadow
  const createIfHelper: CreateRule<Model, Claims> = (request, resource) => {
    let doc = request.resource.data;
    let auth = request.auth;
    let isOwner = request.auth.uid == doc.id;
    let isVersion1 = ((doc.version as unknown) as string) == '1';
    let createdNow = doc.createdOn == request.time;
    let ownerIdMatches = doc.owner.uid == request.auth.uid;
    let ownerNameMatches =
      (doc as any).get(['owner', 'name'], -1) ==
      (auth.token as any).get('name', -1);
    let ownerEmailAddressMatches =
      (doc as any).get(['owner', 'email', 'address'], -1) ==
      (auth.token as any).get('email', -1);
    let ownerEmailVerifiedMatches =
      (doc as any).get(['owner', 'email', 'verified'], -1) ==
      (auth.token as any).get('email_verified', -1);
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
  type Model = ConvertDataModel<Invitation<'read'>>;

  const isPasswordValid = (p: StringFire): boolean => p.matches('^\\w{3,}$');

  const create: CreateRule<Model, Claims> = (request, resource) =>
    ((request.resource.data.version as unknown) as string) == '1' &&
    request.resource.data.groceryListId == request.auth.uid &&
    isPasswordValid(request.resource.data.password) &&
    request.resource.data.createdOn == request.time;

  const update: UpdateRule<Model, Claims> = (request, resource) =>
    ((request.resource.data.version as unknown) as string) == '1' &&
    request.resource.data.groceryListId == request.auth.uid &&
    isPasswordValid(request.resource.data.password);

  const deleteIf: DeleteRule<Model, Claims> = (request, resource) =>
    resource.data.groceryListId == request.auth.uid;

  const read: ReadRule<Model, Claims> = (request, resource) =>
    resource.data.groceryListId == request.auth.uid;
}

// namespace OpenInvitation {
//   type Model = ConvertDataModel<OpenInvitation<'read'>>;

//   const ownsGroceryList: UtilityFunction<
//     Model,
//     Claims,
//     undefined,
//     ReadRequest | 'delete'
//   > = (request, resource) => {
//     return request.auth.uid == resource.data.groceryListId;
//   };

//   const isValid = (request: Request<Model, Claims, 'create'>): boolean => {
//     let data = request.resource.data;
//     return (
//       ((data.version as unknown) as string) == '1' &&
//       data.createdOn == request.time &&
//       data.groceryListId == request.auth.uid &&
//       data.password.matches('^\\w{3,}$')
//     );
//   };

//   const CREATE: CreateRule<Model, Claims> = (request, resource) =>
//     isValid(request);

//   const UPDATE: UpdateRule<Model, Claims> = (request, resource) => false;

//   const DELETE: DeleteRule<Model, Claims> = (request, resource) =>
//     ownsGroceryList(request, resource);

//   const READ: ReadRule<Model, Claims> = (request, resource) =>
//     ownsGroceryList(request, resource);
// }

export {};
