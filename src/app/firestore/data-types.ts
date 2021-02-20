import * as firebase from 'firebase';

type FieldValue = firebase.default.firestore.FieldValue;

export type Uid = string;
export type ListId = string;

export type DocumentMode = 'read' | 'create' | 'update';

export interface Email {
  address: string;
  verified: boolean;
}

export interface UserToken {
  uid: Uid;
  name?: string;
  email?: Email;
}

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

export type CollectionName = 'list' | 'animal' | 'member';
//
export const SERVER_TIMESTAMP: FieldValue = firebase.default.firestore.FieldValue.serverTimestamp();

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
