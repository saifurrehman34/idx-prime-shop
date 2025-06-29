import type { Tables } from './database.types';

export type Product = Tables<'products'> & {
  imageUrl: string;
  longDescription: string;
  dataAiHint: string;
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Category = Tables<'categories'>;

export type UserProfile = Tables<'user_profiles'>;

export type Order = Tables<'orders'>;

export type OrderItem = Tables<'order_items'>;

export type Address = Tables<'addresses'>;

export type Review = Tables<'reviews'>;

export type Wishlist = Tables<'wishlists'>;
