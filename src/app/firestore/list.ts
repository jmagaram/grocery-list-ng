import { List, UserToken } from './data-types';

export function createList(owner: UserToken): List<'create'> {
  let result: List<'create'> = {
    version: '1',
    createdOn: 'a',
    id: owner.uid,
    owner: {
      uid: owner.uid,
      name: owner.name,
    },
  };
  if (owner.email != undefined) {
    result.owner.email = {
      address: owner.email.address,
      verified: owner.email.verified,
    };
  }
  return result;
}
