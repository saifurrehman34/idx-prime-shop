export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  longDescription: string;
  dataAiHint: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
