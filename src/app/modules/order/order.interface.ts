export type IProductFilterRequest = {
  searchTerm?: string | undefined;
};

export type IOrderCreatedEvent = {
  warehouseId: number;
  customerId: number;
  inchargeId: number;
  createdById: number;
  products: {
    price?: number;
    texPercentage?: number;
    productId: number;
    quantity: number;
  }[];
};
export type IOrderEditEvent = {
  warehouseId: number;
  customerId: number;
  inchargeId: number;
  createdById: number;
  products: {
    price?: number;
    texPercentage?: number;
    productId: number;
    quantity: number;
  }[];
};
