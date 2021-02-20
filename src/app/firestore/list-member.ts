import { ListId, ListMember, UserToken, SERVER_TIMESTAMP } from './data-types';

export function createListMember(
  listId: ListId,
  member: UserToken
): ListMember<'create'> {
  return {
    version: '1',
    joinedOn: SERVER_TIMESTAMP,
    listId: listId,
    user: member,
    id: JSON.stringify({ listId: listId, memberId: member.uid }),
  };
}
