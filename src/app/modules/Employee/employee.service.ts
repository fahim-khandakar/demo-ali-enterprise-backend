import { Power, Prisma, User, UserDetails } from '@prisma/client';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import {
  generateVerificationCode,
  sendVerificationEmail,
  storeVerificationCode,
} from '../../../helpers/Email Helpers/Helpers/emailverify';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { EmployeeSearchableFields } from './employee.constant';
import { CreateUserInput, IEmployeeFilterRequest } from './employee.interface';

const insertIntoDB = async (
  data: CreateUserInput,
  role: string,
): Promise<User> => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: data.email },
  });
  const isContactNoExist = await prisma.userDetails.findUnique({
    where: { contactNo: data.contactNo },
  });

  if (isUserExist) {
    throw new ApiError(409, 'User with this email already exists');
  }
  if (isContactNoExist) {
    throw new ApiError(409, 'User with this contact number already exists');
  }

  const verificationCode = generateVerificationCode();
  storeVerificationCode(data?.email, verificationCode);
  await sendVerificationEmail(data?.email, verificationCode);

  const hashedPassword = await bcrypt.hash(
    config.default_pass || '123456',
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.user.create({
    data: {
      email: data.email,
      role: role,
      password: hashedPassword,
      details: {
        create: {
          email: data.email,
          name: data.name,
          contactNo: data.contactNo,
          designation: data.designation,
          profileImage: data.profileImage,
          role: role,
          powers: {
            connect: data.powerId.map(id => ({ id })),
          },
        },
      },
    },
    include: {
      details: true,
    },
  });
  return result;
};

const createPower = async (name: string): Promise<Power> => {
  const result = await prisma.power.create({
    data: {
      name: name,
    },
  });

  return result;
};

const getAllFromDB = async (
  filters: IEmployeeFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<UserDetails[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: EmployeeSearchableFields.map(field => ({
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

  const whereConditions: Prisma.UserDetailsWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.userDetails.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { user: { createdAt: 'desc' } },
  });

  const total = await prisma.userDetails.count({
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
const getAllPowerFromDB = async (): Promise<IGenericResponse<Power[]>> => {
  const result = await prisma.power.findMany();

  const total = await prisma.power.count();

  return {
    meta: {
      total,
      limit: 1,
      page: 1,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: number): Promise<UserDetails | null> => {
  const result = await prisma.userDetails.findUnique({
    where: {
      id,
    },
    include: {
      powers: {
        select: {
          id: true,
        },
      },
    },
  });
  return {
    ...result,
    powers: result?.powers.map(p => p.id),
  } as any;
};

const updateIntoDB = async (
  id: string,
  payload: CreateUserInput,
): Promise<UserDetails> => {
  const { powerId, ...userDetailsData } = payload;
  const result = await prisma.userDetails.update({
    where: {
      id: parseInt(id),
    },
    data: {
      ...userDetailsData,
      powers: {
        set: powerId.map(id => ({ id })),
      },
      user: userDetailsData.email
        ? {
            update: {
              email: userDetailsData.email,
            },
          }
        : undefined,
    },
    include: {
      powers: true,
      user: true,
    },
  });
  return result;
};

const deleteFromDB = async (id: string): Promise<UserDetails> => {
  const user = await prisma.userDetails.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      user: true,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'user not found');
  }
  const result = await prisma.userDetails.delete({
    where: {
      id: parseInt(id),
    },
  });
  await prisma.user.delete({
    where: {
      id: result.userId,
    },
  });

  return result;
};

export const EmployeeService = {
  getAllFromDB,
  getByIdFromDB,
  deleteFromDB,
  updateIntoDB,
  getAllPowerFromDB,
  insertIntoDB,
  createPower,
};
