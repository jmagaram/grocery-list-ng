type CategoryId = string;
type UserId = string;
type Email = string;
type InvitationId = string;
type Role = 'Member' | 'Owner';

interface User {
  id: UserId;
  preferLargeFont: boolean; // private, can't read this
  paidSubscriber: boolean;
  // name:string; // this could be public?
}

export type CollectionName =
  | 'public'
  | 'shoppinglist'
  | 'animals'
  | 'users'
  | 'rooms';

// If a shopping list doesn't have a name...
// Owner : Justin
// Members : Amy, Shawn, Ezra
// -- or --
// My Personal Shopping List

// Creation date might be useful for a time-limited trial
export interface ShoppingList {
  id: UserId; // Every user has their own personal shopping list
  ownerName?: string; // So other members can see the name of the owner, is missing for anonymous
  members: {
    [user in UserId]: string;
  };
}

interface OpenInvitation {
  shoppingList: UserId;
  expires: Date;
}

// one member can't delete another!
interface Category {
  shoppingList: UserId;
  members: UserId[];
  id: CategoryId;
  name: string;
  order: number;
}

export { Category };
