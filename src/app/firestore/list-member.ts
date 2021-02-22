import { ListId, ListMember, UserToken } from './data-types';

export function createListMember(
  listId: ListId,
  member: UserToken
): ListMember<'create'> {
  return {
    version: '1',
    joinedOn: 'a',
    listId: listId,
    user: member,
    id: JSON.stringify({ listId: listId, memberId: member.uid }),
  };
}
