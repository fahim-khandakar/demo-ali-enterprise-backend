import { Prisma, User, WarehouseProduct } from '@prisma/client';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  IWarehouseProductFilterRequest,
  WarehouseProductCreatedEvent,
  WarehouseProductCreatedEventMulti,
} from './warehouseProduct.interface';

const insertIntoDB = async (
  data: WarehouseProductCreatedEvent[],
  user: User,
): Promise<WarehouseProduct[]> => {
  const warehouseProducts = await prisma.$transaction(async prisma => {
    const results = [];

    for (const item of data) {
      let warehouseProduct = await prisma.warehouseProduct.findFirst({
        where: {
          warehouseId: parseInt(item.warehouseId),
          productId: parseInt(item.productId),
        },
      });

      if (warehouseProduct) {
        warehouseProduct = await prisma.warehouseProduct.update({
          where: { id: warehouseProduct.id },
          data: {
            quantity: warehouseProduct.quantity + parseInt(item.quantity),
          },
        });
      } else {
        warehouseProduct = await prisma.warehouseProduct.create({
          data: {
            warehouseId: parseInt(item.warehouseId),
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
          },
        });
      }

      await prisma.product.update({
        where: { id: parseInt(item.productId) },
        data: {
          availableQty: {
            increment: parseInt(item.quantity),
          },
          totalPurchased: {
            increment: parseInt(item.quantity),
          },
        },
      });

      await prisma.warehouseProductLog.create({
        data: {
          warehouseId: parseInt(item.warehouseId),
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          userId: user.id,
        },
      });
      results.push(warehouseProduct);
    }

    return results;
  });

  return warehouseProducts;
};

const MultiInsertIntoDB = async (
  data: WarehouseProductCreatedEventMulti[],
  user: User,
): Promise<WarehouseProduct[]> => {
  const results = [];

  for (const item of data) {
    let product = await prisma.product.findFirst({
      where: {
        name: item.name,
        brand: item.brand,
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: item.name,
          brand: item.brand,
          purchaseCost: 0,
          unit: 'pcs',
          remainderQty: 10,
        },
      });
    }

    const warehouseIsExist = await prisma.warehouse.findUnique({
      where: {
        id: Number(item?.warehouseId),
      },
    });

    if (!warehouseIsExist) {
      throw new ApiError(400, `Warehouse ${item?.warehouseId} not found!`);
    }

    const productId = product.id;

    // Check if the warehouse product exists
    let warehouseProduct = await prisma.warehouseProduct.findFirst({
      where: {
        warehouseId: parseInt(item.warehouseId),
        productId: productId,
      },
    });

    if (warehouseProduct) {
      // Update the existing warehouse product
      warehouseProduct = await prisma.warehouseProduct.update({
        where: { id: warehouseProduct.id },
        data: {
          quantity: warehouseProduct.quantity + parseInt(item.quantity),
        },
      });
    } else {
      // Create a new warehouse product
      warehouseProduct = await prisma.warehouseProduct.create({
        data: {
          warehouseId: parseInt(item.warehouseId),
          productId: productId,
          quantity: parseInt(item.quantity),
        },
      });
    }

    // Update the product quantities
    await prisma.product.update({
      where: { id: productId },
      data: {
        availableQty: {
          increment: parseInt(item.quantity),
        },
        totalPurchased: {
          increment: parseInt(item.quantity),
        },
      },
    });

    // Insert log
    await prisma.warehouseProductLog.create({
      data: {
        warehouseId: parseInt(item.warehouseId),
        productId,
        quantity: parseInt(item.quantity),
        userId: user.id,
      },
    });

    results.push(warehouseProduct);
  }

  return results;
};

const getAllFromDB = async (
  filters: IWarehouseProductFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<WarehouseProduct[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.WarehouseProductWhereInput[] = [];

  andConditions.push({
    quantity: {
      gt: 0,
    },
  });

  if (searchTerm) {
    andConditions.push({
      OR: [
        { product: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { product: { brand: { contains: searchTerm, mode: 'insensitive' } } },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions: Prisma.WarehouseProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.warehouseProduct.findMany({
    where: whereConditions,
    include: {
      product: {
        select: {
          name: true,
          brand: true,
        },
      },
      warehouse: {
        select: {
          name: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.warehouseProduct.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: number): Promise<WarehouseProduct | null> => {
  const result = await prisma.warehouseProduct.findUnique({
    where: {
      id,
    },
    include: {
      product: {
        select: {
          name: true,
          brand: true,
        },
      },
      warehouse: {
        select: {
          name: true,
        },
      },
    },
  });
  return result;
};

const CheckQtyFromDB = async (
  warehouseId: string,
  productId: string,
  quantity: number,
): Promise<WarehouseProduct | null> => {
  const result = await prisma.warehouseProduct.findFirst({
    where: {
      warehouseId: parseInt(warehouseId),
      productId: parseInt(productId),
      quantity: {
        gte: quantity,
      },
    },
  });

  return result;
};

const getBywarehouseProductCountFromDB = async () => {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      products: {
        select: {
          quantity: true,
        },
      },
    },
  });
  const summary = warehouses.map(warehouse => {
    const productCount = warehouse.products.length;
    const totalQuantity = warehouse.products.reduce(
      (sum, product) => sum + product.quantity,
      0,
    );

    return {
      id: warehouse.id,
      warehouseName: warehouse.name,
      productCount,
      totalQuantity,
    };
  });
  return summary;
};

const updateIntoDB = async (
  payload: {
    warehouseId: number;
    productId: number;
    quantity: number;
  },
  user: User,
): Promise<WarehouseProduct> => {
  const warehouseProduct = await prisma.warehouseProduct.findUnique({
    where: {
      warehouseId_productId: {
        warehouseId: payload.warehouseId,
        productId: payload.productId,
      },
    },
  });

  if (!warehouseProduct) {
    throw new ApiError(400, 'not found product');
  }

  const updatedWarehouseProduct = await prisma.$transaction(async prisma => {
    const updatedWarehouseProduct = await prisma.warehouseProduct.update({
      where: { id: warehouseProduct.id },
      data: { quantity: payload.quantity },
    });
    await prisma.product.update({
      where: { id: payload.productId },
      data: {
        availableQty: {
          decrement: warehouseProduct.quantity,
        },
        totalPurchased: {
          decrement: warehouseProduct.quantity,
        },
      },
    });

    // Step 2: Add the new quantity
    await prisma.product.update({
      where: { id: payload.productId },
      data: {
        availableQty: {
          increment: payload.quantity,
        },
        totalPurchased: {
          increment: payload.quantity,
        },
      },
    });

    // Log the quantity update
    await prisma.warehouseProductLog.create({
      data: {
        warehouseId: payload.warehouseId,
        productId: payload.productId,
        quantity: -payload.quantity,
        userId: user.id,
      },
    });

    return updatedWarehouseProduct;
  });

  return updatedWarehouseProduct;
};

export const warehouseProductService = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  getBywarehouseProductCountFromDB,
  CheckQtyFromDB,
  MultiInsertIntoDB,
  updateIntoDB,
};
