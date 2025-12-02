import { Prisma, WarehouseProductLog } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { IWarehouseFilterRequest } from './warehouseLogs.interface';

const getAllFromDB = async (
  filters: IWarehouseFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<WarehouseProductLog[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const andConditions: any = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          product: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          product: {
            brand: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.WarehouseProductLogWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.warehouseProductLog.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
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
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const total = await prisma.warehouseProductLog.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateOneInDB = async (
  id: string,
  payload: Partial<WarehouseProductLog>,
): Promise<WarehouseProductLog> => {
  const result = await prisma.warehouseProductLog.update({
    where: {
      id: parseInt(id),
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<WarehouseProductLog> => {
  const result = await prisma.warehouseProductLog.delete({
    where: {
      id: parseInt(id),
    },
  });
  return result;
};

export const WarehouseLogsService = {
  getAllFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
