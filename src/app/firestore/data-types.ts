export type GroceryListId = string;

export type Replace<T, K extends keyof T, V> = {
  [P in keyof T]: P extends K ? V : T[P];
};

export type ExcludeId<T> = Omit<T, 'id'>;

// TODO Belongs in this file?
export interface Claims {
  memberOf?: GroceryListId;
}

export type Animal = {
  id: string;
  type: string;
  color: string;
};

export type Email = {
  address: string;
  verified: boolean;
};

export type UserToken = {
  uid: string;
  name?: string;
  email?: Email;
};

export type GroceryList = {
  id: string; // Owner uid
  version: '1';
  createdOn: Date;
  owner?: Omit<UserToken, 'uid'>;
  members: Record<string, Omit<UserToken, 'uid'>>;
};

// TODO Ensure no list permissions
export interface Invitation {
  id: string; // Must be unique within firestore
  owner: string;
  createdOn: Date;
  version: '1';
}

export type InvitationDetails = {
  owner: UserToken;
  members: UserToken[];
};
