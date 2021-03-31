import { mapString, visibleString } from '../common/utilities';
import { GroceryList, Replace } from './data-types';

export const createGroceryList = <NOW>(i: {
  now: NOW;
  userId: string;
  displayName: string | null | undefined;
  emailAddress: string | null | undefined;
  emailVerified: boolean;
}): Replace<GroceryList, 'createdOn', NOW> => ({
  id: i.userId,
  createdOn: i.now,
  version: '1',
  members: {},
  owner: {
    name: visibleString(i.displayName),
    email: mapString(
      i.emailAddress,
      (j) => ({ address: j, verified: i.emailVerified }),
      undefined
    ),
  },
});

export const invitationPassword = () => {
  const randomChar = () => {
    const letters = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const characters = `${letters}${letters.toUpperCase()}${numbers}`;
    const index = Math.trunc((Math.random() * 1000) % characters.length);
    return characters[index];
  };
  const randomString = (length: number) =>
    new Array<undefined>(length)
      .fill(undefined)
      .map((_) => randomChar())
      .reduce((total, i) => total + i, '');
  return `${randomString(3)}-${randomString(4)}`;
};
