export type Uid = string;
export type ListId = string;

export type DocumentMode = 'read' | 'create' | 'update' | 'merge';

export interface Email {
  address: string;
  verified: boolean;
}

export interface UserToken {
  uid: Uid;
  name?: string;
  email?: Email;
}

export type FieldValue = any;

export interface List<M extends DocumentMode> {
  id: string;
  version: '1';
  createdOn: M extends 'create' ? FieldValue : Date;
  owner: UserToken;
}

export interface ListMember<M extends DocumentMode> {
  id: string;
  version: '1';
  joinedOn: M extends 'create' ? FieldValue : Date;
  listId: ListId;
  user: UserToken;
}

export interface Post<MODE extends 'create' | 'read'> {
  comment: string;
  createdOn: MODE extends 'create' ? FieldValue : Date;
}

export type CollectionName = 'list' | 'animal' | 'member' | 'shoppinglist';

export const shoppingListCollection: CollectionName = 'shoppinglist';

export interface OpenInvitation<M extends DocumentMode | 'invite'> {
  createdOn: M extends 'invite' ? FieldValue : Date;
  password: string;
}

export interface ShoppingList<M extends DocumentMode | 'invite'> {
  id: Uid;
  version: '1';
  createdOn: M extends 'create' ? FieldValue : Date;
  owner: UserToken;
  members: Record<string, UserToken>;
  openInvitation?: OpenInvitation<M>;
}

// community and discussion?
// everyone has a public profile
//

// who is in the shopping list?
// find all memberships where membership =

// everyone see who is in the shopping list they are using
// remove a member
// invitation

// type TimestampsMode = 'create' | 'update' | 'read';

// type Timestamps<T extends TimestampsMode> = T extends 'create'
//   ? {
//       createdOn: FieldValue;
//       modifiedOn: FieldValue;
//     }
//   : T extends 'update'
//   ? { modifiedOn: FieldValue }
//   : T extends 'read'
//   ? { createdOn: Date; modifiedOn: Date }
//   : never;

// type IdMode = 'id-generate' | 'id-manual';

// type Id<T extends IdMode> = T extends 'id-generate'
//   ? {}
//   : T extends 'id-manual'
//   ? { id: Readonly<string> }
//   : never;

// export const timestamps: Timestamps<'create'> = {
//   createdOn: SERVER_TIMESTAMP,
//   modifiedOn: SERVER_TIMESTAMP,
// };

// export type Document<T, V> = Id<'id-manual'> &
//   Timestamps<'read'> &
//   Version<V> &
//   T;

// export type NewDocument<T, V, ID extends IdMode> = Id<ID> &
//   Version<V> &
//   Timestamps<'create'> &
//   T;

// export interface Members {
//   [uid: string]: Omit<UserToken, 'uid'>;
// }

// export interface Members {
//   [uid: string]: Omit<UserToken, 'uid'>;
// }
