import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DashboardService } from './dashboard.service';

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  // const filters = pick(req.query, DashboardFilterableFields);
  // const options = pick(req.query, paginationFields);
  const result = await DashboardService.getDashboardData();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    // meta: result.meta,
    data: result,
  });
});

export const EmployeeController = {
  getAllFromDB,
};
