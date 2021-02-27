export type Uid = string;
export type GroceryListId = string;

export type DocumentMode = 'read' | 'create' | 'update' | 'merge';

export type FieldValue = any;

export type CollectionName = 'animal' | 'grocerylist' | 'invitation';
export const groceryListCollection: CollectionName = 'grocerylist';
export const animalCollection: CollectionName = 'animal';
export const invitationCollection: CollectionName = 'invitation';

export interface Claims {
  memberOf?: GroceryListId;
}

export interface Animal {
  type: string;
  color: string;
}

export type Email = {
  address: string;
  verified: boolean;
};

export type UserToken = {
  uid: Uid;
  name?: string;
  email?: Email;
};

export interface GroceryList<M extends DocumentMode> {
  id: Uid;
  version: '1';
  createdOn: FieldValue | Date;
  owner: UserToken;
  members: Record<string, UserToken>;
  openInvitation?: OpenInvitation<M>;
}

export interface OpenInvitation<M extends DocumentMode> {
  readonly id: M extends 'create' ? undefined : string;
  readonly version: '1';
  readonly groceryListId: GroceryListId;
  readonly createdOn: M extends 'read' ? Date : FieldValue | Date;
  readonly password: string;
}

export interface Invitation<M extends DocumentMode> {
  readonly id: M extends 'create' ? undefined : string;
  readonly version: '1';
  owner: UserToken;
  createdOn: M extends 'read' ? Date : FieldValue | Date;
  password: string;
}
