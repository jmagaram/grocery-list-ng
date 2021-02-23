import { from } from 'fromfrom';
import { range } from '../common/utilities';
import { FieldValue, GroceryList, Uid } from './data-types';

export const createGroceryList = (i: {
  userId: Uid;
  displayName?: string;
  emailAddress?: string;
  emailVerified: boolean;
  serverTimestamp: FieldValue;
}): GroceryList<'create'> => {
  const result: GroceryList<'create'> = {
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
};

export const createPassword = () => {
  const randomCharacter = () => {
    const characters = 'abcdefghjkmnpqrstuvwxyz23456789';
    const index = Math.trunc((Math.random() * 1000) % characters.length);
    return characters[index];
  };
  const randomString = (length: number) =>
    from(range(1, length))
      .map((_) => randomCharacter())
      .reduce((s, total) => s + total, '');
  return `${randomString(3)}-${randomString(4)}`;
};

// const createGroceryListOpenInvitation = (
//   serverTimestamp: FieldValue
// ): OpenInvitation<'create'> => ({
//   createdOn: serverTimestamp,
//   password: createPassword(),
// });