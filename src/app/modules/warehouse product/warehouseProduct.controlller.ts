/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { productFilterableFields } from './warehouseProduct.constant';
import { warehouseProductService } from './warehouseProduct.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const user= req.user;
  const result = await warehouseProductService.insertIntoDB(req.body,user as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product quantity updated successfully',
    data: result,
  });
});
const FileInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const user= req.user;
  const result = await warehouseProductService.MultiInsertIntoDB(req.body,user as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product quantity updated successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
   
  const filters: any = pick(req.query, productFilterableFields);
  if (filters.warehouseId) {
    filters.warehouseId = parseInt(filters.warehouseId as string, 10);
  }
  const options = pick(req.query, paginationFields);
  const result = await warehouseProductService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product data fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseId = parseInt(id);
  const result = await warehouseProductService.getByIdFromDB(parseId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product quantity fetched successfully',
    data: result,
  });
});

const checkQtyFromDB = catchAsync(async (req: Request, res: Response) => {
  const { warehouseId, productId, quantity } = req.body;
  const result = await warehouseProductService.CheckQtyFromDB(
    warehouseId,
    productId,
    quantity,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product quantity fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await warehouseProductService.updateIntoDB(req.body,user as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'warehouse updated successfully',
    data: result,
  });
});

const getwarehouseProductcountromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await warehouseProductService.getBywarehouseProductCountFromDB();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'product quantity fetched successfully',
      data: result,
    });
  },
);

export const warehouseProductController = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  getwarehouseProductcountromDB,
  checkQtyFromDB,
  FileInsertIntoDB
};
