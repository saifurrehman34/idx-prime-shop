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
