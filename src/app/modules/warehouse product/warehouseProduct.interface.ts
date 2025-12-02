export type IWarehouseProductFilterRequest = {
  searchTerm?: string | undefined;
  warehoueId?: number | undefined;
  productId?: number | undefined;
};

export type WarehouseProductCreatedEvent = {
  warehouseId: string;
  productId: string;
  quantity: string;
};
export type WarehouseProductCreatedEventMulti = {
  warehouseId: string;
  name: string;
  brand: string;
  quantity: string;
};
