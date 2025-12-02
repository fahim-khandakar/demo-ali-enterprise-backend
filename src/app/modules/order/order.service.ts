import { Order, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { IEmployeeFilterRequest } from '../Employee/employee.interface';
import { IOrderCreatedEvent, IOrderEditEvent } from './order.interface';
import { generateOrderId } from './order.utilis';

const insertIntoDB = async (data: IOrderCreatedEvent): Promise<Order> => {
  const id = await generateOrderId();
  try {
    const result = await prisma.$transaction(async tx => {
      for (const { productId, quantity } of data.products) {
        const warehouseProduct = await tx.warehouseProduct.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: data.warehouseId,
              productId,
            },
          },
        });

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        const warehouse = await tx.warehouse.findUnique({
          where: { id: data.warehouseId },
        });

        if (!warehouseProduct || warehouseProduct.quantity < quantity) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Insufficient quantity for product "${product?.name}" in warehouse "${warehouse?.name}"`,
          );
        }
      }

      const order = await tx.order.create({
        data: {
          invoiceId: id,
          warehouseId: data.warehouseId,
          customerId: data.customerId,
          inchargeId: data.inchargeId,
          createdById: data.createdById,
          products: {
            create: data.products.map(p => ({
              price: p.price?.toFixed(2),
              texPercentage: p.texPercentage?.toFixed(2),
              productId: p.productId,
              quantity: p.quantity,
            })),
          },
        },
        include: {
          products: true,
        },
      });

      for (const { productId, quantity } of data.products) {
        await tx.warehouseProduct.update({
          where: {
            warehouseId_productId: {
              warehouseId: data.warehouseId,
              productId,
            },
          },
          data: {
            quantity: { decrement: quantity },
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            availableQty: { decrement: quantity },
            sell: { increment: quantity },
          },
        });
      }

      return order;
    });

    return result;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || 'Failed to insert order',
    );
  }
};

const getAllFromDB = async (
  filters: IEmployeeFilterRequest,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.OrderWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { invoiceId: { contains: searchTerm, mode: 'insensitive' } },
        { customer: { name: { contains: searchTerm, mode: 'insensitive' } } },
        {
          customer: {
            contactNo: { contains: searchTerm, mode: 'insensitive' },
          },
        },
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

  const whereConditions: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    include: {
      customer: {
        select: {
          name: true,
        },
      },
      incharge: {
        select: {
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
      warehouse: {
        select: {
          name: true,
        },
      },
      products: {
        select: {
          price: true,
          texPercentage: true,
          product: {
            select: {
              name: true,
            },
          },
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

  const total = await prisma.order.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result.map(order => ({
      ...order,
      products: order.products.map(op => op.product.name),
    })),
  };
};

const getByIdFromDB = async (id: number): Promise<Order | null> => {
  const result = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      warehouse: {
        select: {
          name: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
        },
      },
      incharge: {
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
        },
      },
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
            },
          },
        },
      },
    },
  });
  return result;
};

const updateInToDB = async (
  orderId: number,
  data: IOrderEditEvent,
): Promise<Order> => {
  try {
    const result = await prisma.$transaction(async tx => {
      // 1️⃣ Get the existing order with products
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { products: true },
      });

      if (!existingOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
      }

      // 2️⃣ Restore old product quantities (reverse previous changes)
      for (const oldProduct of existingOrder.products) {
        await tx.warehouseProduct.update({
          where: {
            warehouseId_productId: {
              warehouseId: existingOrder.warehouseId,
              productId: oldProduct.productId,
            },
          },
          data: {
            quantity: { increment: oldProduct.quantity },
          },
        });

        await tx.product.update({
          where: { id: oldProduct.productId },
          data: {
            availableQty: { increment: oldProduct.quantity },
            sell: { decrement: oldProduct.quantity },
          },
        });
      }

      // 3️⃣ Delete old order products
      await tx.orderProduct.deleteMany({
        where: { orderId },
      });

      // 4️⃣ Check warehouse quantity for each new product
      for (const { productId, quantity } of data.products) {
        const warehouseProduct = await tx.warehouseProduct.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: data.warehouseId,
              productId,
            },
          },
        });

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        const warehouse = await tx.warehouse.findUnique({
          where: { id: data.warehouseId },
        });

        if (!warehouseProduct || warehouseProduct.quantity < quantity) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Insufficient quantity for product "${product?.name}" in warehouse "${warehouse?.name}"`,
          );
        }
      }

      // 5️⃣ Update order main info
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          warehouseId: data.warehouseId,
          customerId: data.customerId,
          inchargeId: data.inchargeId,
          products: {
            create: data.products.map(p => ({
              price: p.price?.toFixed(2),
              texPercentage: p.texPercentage?.toFixed(2),
              productId: p.productId,
              quantity: p.quantity,
            })),
          },
        },
        include: { products: true },
      });

      // 6️⃣ Decrease new quantities from warehouse and product stock
      for (const { productId, quantity } of data.products) {
        await tx.warehouseProduct.update({
          where: {
            warehouseId_productId: {
              warehouseId: data.warehouseId,
              productId,
            },
          },
          data: {
            quantity: { decrement: quantity },
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            availableQty: { decrement: quantity },
            sell: { increment: quantity },
          },
        });
      }

      return updatedOrder;
    });

    return result;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || 'Failed to update order',
    );
  }
};

export const orderService = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateInToDB,
};
