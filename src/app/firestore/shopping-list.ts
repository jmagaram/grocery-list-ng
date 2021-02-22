import { ShoppingList, Uid, FieldValue, OpenInvitation } from './data-types';
import { from } from 'fromfrom';
import { range } from '../common/utilities';

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

export function createPassword() {
  const randomCharacter = () => {
    const characters = 'abcdefghjkmnpqrstuvwxyz23456789';
    let index = Math.trunc((Math.random() * 1000) % characters.length);
    return characters[index];
  };
  const randomString = (length: number) =>
    from(range(1, length))
      .map((_) => randomCharacter())
      .reduce((s, total) => s + total, '');
  return `${randomString(3)}-${randomString(4)}`;
}

export function createOpenInvitation(
  serverTimestamp: FieldValue
): OpenInvitation<'create'> {
  return {
    createdOn: serverTimestamp,
    password: createPassword(),
  };
}
