import { Prisma, Product } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { productSearchableFields } from './product.constant';
import {
  IProductFilterRequest,
  ProductCreatedEvent,
  ProductWithWarehouseInfo,
} from './product.interface';

const insertIntoDB = async (data: ProductCreatedEvent): Promise<Product> => {
  const isExist = await prisma.product.findUnique({
    where: {
      name_brand: {
        name: data.name,
        brand: data.brand,
      },
    },
  });

  if (isExist) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Product "${data.name}" from brand "${data.brand}" already exists`,
    );
  }

  const result = await prisma.product.create({
    data: {
      name: data.name,
      brand: data.brand,
      purchaseCost: data.purchaseCost,
      unit: data.unit,
      remainderQty: data.remainderQty,
    },
  });
  return result;
};
const insertManyIntoDB = async (
  data: ProductCreatedEvent[],
): Promise<number> => {
  for (const item of data) {
    const isExist = await prisma.product.findFirst({
      where: {
        name: item.name,
        brand: item.brand,
      },
    });

    if (isExist) {
      throw new ApiError(
        httpStatus.CONFLICT,
        `Product "${item.name}" from brand "${item.brand}" already exists`,
      );
    }
  }

  const result = await prisma.product.createMany({ data });
  return result.count;
};

const getAllFromDB = async (
  filters: IProductFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<Product[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.product.count({
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
const getEmptyFromDB = async (
  filters: IProductFilterRequest,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  andConditions.push({
    availableQty: 0,
  });
  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    select: {
      id: true,
      name: true,
      brand: true,
      remainderQty: true,
      availableQty: true,
    },
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.product.count({
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

const getRemainderFromDB = async (
  filters: IProductFilterRequest,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  andConditions.push({
    availableQty: {
      lte: prisma.product.fields.remainderQty,
    },
  });

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    select: {
      id: true,
      name: true,
      brand: true,
      remainderQty: true,
      availableQty: true,
    },
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.product.count({
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
const getRemainderCountFromDB = async () => {
  const total = await prisma.product.count({
    where: {
      availableQty: {
        lte: prisma.product.fields.remainderQty,
      },
    },
  });

  return total;
};

const getAvailableQtyFromDB = async (
  filters: IProductFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<Product[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  andConditions.push({
    availableQty: {
      gt: 0,
    },
  });
  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.product.count({
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

const getInventoryReportFromDB = async (
  filters: IProductFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<ProductWithWarehouseInfo[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      brand: true,
      availableQty: true,
      warehouses: {
        select: {
          quantity: true,
          warehouse: {
            select: {
              name: true,
            },
          },
        },
      },
    },

    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.product.count({
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

const getByIdFromDB = async (id: number): Promise<Product | null> => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      warehouses: true,
    },
  });
  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Product>,
): Promise<Product> => {
  const result = await prisma.product.update({
    where: {
      id: parseInt(id),
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Product | null> => {
  const productId = parseInt(id);

  try {
    const result = await prisma.$transaction(async prisma => {
      await prisma.orderProduct.deleteMany({
        where: {
          productId: productId,
        },
      });

      await prisma.warehouseProduct.deleteMany({
        where: {
          productId: productId,
        },
      });
      await prisma.warehouseProductLog.deleteMany({
        where: {
          productId: productId,
        },
      });

      const deletedProduct = await prisma.product.delete({
        where: {
          id: productId,
        },
      });

      return deletedProduct;
    });

    return result;
  } catch (error) {
    throw new ApiError(500, (error as Error).message);
    return null;
  }
};

export const ProductService = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  getAvailableQtyFromDB,
  getInventoryReportFromDB,
  getRemainderFromDB,
  getRemainderCountFromDB,
  getEmptyFromDB,
  insertManyIntoDB,
};
