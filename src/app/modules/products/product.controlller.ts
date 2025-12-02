import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { productFilterableFields } from './product.constant';
import { ProductService } from './product.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.insertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product created successfully',
    data: result,
  });
});
const FileInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.insertManyIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await ProductService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});
const getEmptyFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await ProductService.getEmptyFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Empty products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});
const getRemainderFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await ProductService.getRemainderFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'low quantity products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});
const getRemainderCountFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getRemainderCountFromDB();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'low quantity products count successfully',
      data: result,
    });
  },
);
const getAvailableFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await ProductService.getAvailableQtyFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});
const getInventoryReportFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const options = pick(req.query, paginationFields);
    const result = await ProductService.getInventoryReportFromDB(
      filters,
      options,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'inventory report fetched successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseId = parseInt(id);
  const result = await ProductService.getByIdFromDB(parseId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product delete successfully',
    data: result,
  });
});

export const ProductController = {
  insertIntoDB,
  FileInsertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  getAvailableFromDB,
  getInventoryReportFromDB,
  getRemainderFromDB,
  getRemainderCountFromDB,
  getEmptyFromDB,
};
