export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  longDescription: string;
  dataAiHint: string;
  is_featured: boolean;
  category_id: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
    id: string;
    name: string;
    image_url: string;
    data_ai_hint: string;
    created_at: string;
}
