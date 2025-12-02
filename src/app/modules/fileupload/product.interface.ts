export type IProductFilterRequest = {
  searchTerm?: string | undefined;
  name?: string | undefined;
  brand?: string | undefined;
  availableQty?: string | undefined;
  unit?: string | undefined;
  totalPurchased?: string | undefined;
  remainderQty?: string | undefined;
};

export type ProductCreatedEvent = {
  name: string;
  brand: string;
  purchaseCost: number;
  unit: string;
  remainderQty: number;
};
