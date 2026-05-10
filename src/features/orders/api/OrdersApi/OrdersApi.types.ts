export interface OrderDto {
  id: string;
  userId: string;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  id: string;
  productId: string;
  quantity: number;
}
