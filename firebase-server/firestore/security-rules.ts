/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable arrow-body-style */
/* eslint-disable prefer-const */

import {
  MapFire,
  CreateRule,
  UpdateRule,
  DeleteRule,
  ReadRule,
  ListRule,
  GetRule,
} from './security-rule-types';
import {
  GroceryList,
  Claims,
  Invitation,
} from '../../src/app/firestore/data-types';

// MATCH /animal/{id}
namespace Animals {
  const read: CreateRule<any, any> = (request, resource) => true;
  const write: CreateRule<any, any> = (request, resource) => true;
}

// MATCH /grocerylist/{id}
namespace GroceryListRules {
  type Model = MapFire<GroceryList>;

  const isOwnerOrMember: ReadRule<Model, Claims> = (request, resource) => {
    let isOwner = request.auth.uid === resource.id;
    let isMember = request.auth.token.memberOf === resource.id;
    return isOwner || isMember;
  };

  const create: CreateRule<Model, Claims, 'request'> = (request) => false;

  const read: ReadRule<Model, Claims> = (request, resource) =>
    isOwnerOrMember(request, resource);

  const update: UpdateRule<Model, Claims, 'noparams'> = () => false;

  const deleteIf: DeleteRule<Model, Claims, 'noparams'> = () => false;
}

// MATCH /invitation/{invitationId}
// TODO Validate password
namespace InvitationRules {
  type Model = MapFire<Invitation>;

  const create: CreateRule<Model, Claims> = (request, resource) =>
    request.auth !== null &&
    request.resource.data.owner === request.auth.uid &&
    request.resource.data.version === '1' &&
    request.resource.data.createdOn === request.time;

  const update: UpdateRule<Model, Claims> = (request, resource) => false;

  const deleteIf: DeleteRule<Model, Claims> = (request, resource) =>
    request.auth.uid === resource.data.owner;

  const list: ListRule<Model, Claims> = (request, resource) =>
    request.auth.uid === resource.data.owner;

  const get: GetRule<Model, Claims> = (request, resource) =>
    request.auth !== null &&
    request.auth.token.firebase.sign_in_provider !== 'anonymous';
}

export {};
