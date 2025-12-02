import { Prisma, Warehouse } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { warehouseSearchableFields } from './warehouse.constants';
import { IWarehouseFilterRequest } from './warehouse.interface';

const insertIntoDB = async (data: { name: string }): Promise<Warehouse> => {
  const isExist = await prisma.warehouse.findUnique({
    where: {
      name: data.name,
    },
  });

  if (isExist) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Warehouse with name "${data.name}" already exists`,
    );
  }

  const result = await prisma.warehouse.create({
    data,
  });
  return result;
};

const getAllFromDB = async (
  filters: IWarehouseFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<Warehouse[]>> => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;

  const andConditons = [];

  if (searchTerm) {
    andConditons.push({
      OR: warehouseSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  const whereConditons: Prisma.WarehouseWhereInput =
    andConditons.length > 0 ? { AND: andConditons } : {};

  const result = await prisma.warehouse.findMany({
    skip,
    take: limit,
    where: whereConditons,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.warehouse.count({
    where: whereConditons,
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
  payload: Partial<Warehouse>,
): Promise<Warehouse> => {
  const result = await prisma.warehouse.update({
    where: {
      id: parseInt(id),
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Warehouse> => {
  const result = await prisma.warehouse.delete({
    where: {
      id: parseInt(id),
    },
  });
  return result;
};

export const WarehouseService = {
  insertIntoDB,
  getAllFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
