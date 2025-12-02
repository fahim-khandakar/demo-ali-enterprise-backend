import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import { ENUM_USER_ROLE } from '../../../enums/user';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { EmployeeFilterableFields } from './employee.constant';
import { EmployeeService } from './employee.service';

const createEmployee: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeService.insertIntoDB(
      req.body,
      ENUM_USER_ROLE.EMPLOYEE,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'employee created successfully!',
      data: result,
    });
  },
);
const createPower: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const { email, password, powerId, name, contactNo,designation,profileImage } = req.body;

    const result = await EmployeeService.createPower(req.body.name);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'power created successfully!',
      data: result,
    });
  },
);

const createAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EmployeeService.insertIntoDB(
      req.body,
      ENUM_USER_ROLE.ADMIN,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'admin created successfully!',
      data: result,
    });
  },
);

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, EmployeeFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await EmployeeService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});
const getAllPowerFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await EmployeeService.getAllPowerFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'power fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseId = parseInt(id);
  const result = await EmployeeService.getByIdFromDB(parseId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user fetched successfully',
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await EmployeeService.updateIntoDB(id, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EmployeeService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const EmployeeController = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  getAllPowerFromDB,
  createAdmin,
  createEmployee,
  createPower,
};
