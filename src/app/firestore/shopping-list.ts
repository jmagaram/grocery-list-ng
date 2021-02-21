import { ShoppingList, Uid, FieldValue } from './data-types';

export function create(i: {
  userId: Uid;
  displayName?: string;
  emailAddress?: string;
  emailVerified: boolean;
  serverTimestamp: FieldValue;
}): ShoppingList<'create'> {
  let result: ShoppingList<'create'> = {
    version: '1',
    id: i.userId,
    owner: {
      name: i.displayName,
      uid: i.userId,
      email: i.emailAddress
        ? {
            address: i.emailAddress,
            verified: i.emailVerified,
          }
        : undefined,
    },
    createdOn: i.serverTimestamp,
    members: {},
  };
  return result;
}
