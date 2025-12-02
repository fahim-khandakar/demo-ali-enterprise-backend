import { Customer, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { IEmployeeFilterRequest } from '../Employee/employee.interface';

import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { CustomerSearchableFields } from './customer.constant';
import { CustomerCreatedEvent, CustomerEditEvent } from './customer.interface';

const insertIntoDB = async (data: CustomerCreatedEvent): Promise<Customer> => {
  const result = await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email,
      contactNo: data.contactNo,
      profileImage: data.profileImage,
    },
  });
  return result;
};

const getAllFromDB = async (
  filters: IEmployeeFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<Customer[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: CustomerSearchableFields.map(field => ({
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

  const whereConditions: Prisma.CustomerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.customer.findMany({
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

  const total = await prisma.customer.count({
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

const getByIdFromDB = async (id: number): Promise<Customer | null> => {
  const result = await prisma.customer.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateIntoDB = async (
  id: string,
  payload: CustomerEditEvent,
): Promise<Customer> => {
  const { ...customerData } = payload;
  const result = await prisma.customer.update({
    where: {
      id: parseInt(id),
    },
    data: {
      ...customerData,
    },
  });
  return result;
};

const deleteFromDB = async (id: string): Promise<Customer> => {
  const result = await prisma.customer.delete({
    where: {
      id: parseInt(id),
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'user not found');
  }
  return result;
};

export const CustomerService = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  deleteFromDB,
  updateIntoDB,
};
