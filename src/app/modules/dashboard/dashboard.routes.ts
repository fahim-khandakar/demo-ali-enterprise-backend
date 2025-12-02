import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { EmployeeController } from './dashboard.controller';

const router = express.Router();

router.get(
  '/details',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  EmployeeController.getAllFromDB,
);

export const dashboardRoutes = router;
