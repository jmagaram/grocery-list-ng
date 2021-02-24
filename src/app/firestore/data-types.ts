export type Uid = string;
export type GroceryListId = string;

export type DocumentMode = 'read' | 'create' | 'update' | 'merge';

export type FieldValue = any;

export type CollectionName = 'animal' | 'grocerylist';
export const groceryListCollection: CollectionName = 'grocerylist';
export const animalCollection: CollectionName = 'animal';

export interface Claims {
  memberOf?: GroceryListId;
}

export interface Animal {
  type: string;
  color: string;
}

export interface Email {
  address: string;
  verified: boolean;
}

export interface UserToken {
  uid: Uid;
  name?: string;
  email?: Email;
}

export interface GroceryList<M extends DocumentMode | 'invite'> {
  id: Uid;
  version: '1';
  createdOn: M extends 'create' ? FieldValue : Date;
  owner: UserToken;
  members: Record<string, UserToken>;
  openInvitation?: OpenInvitation<M>;
}

export interface OpenInvitation<M extends DocumentMode | 'invite'> {
  createdOn: M extends 'invite' ? FieldValue : Date;
  password: string;
}
