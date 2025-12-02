import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { EmployeeController } from './employee.controller';
import { EmployeeValidation } from './employee.validation';

const router = express.Router();

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  EmployeeController.getAllFromDB,
);
router.get(
  '/power',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  EmployeeController.getAllPowerFromDB,
);
router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  EmployeeController.getByIdFromDB,
);

router.patch(
  '/:id',
  validateRequest(EmployeeValidation.update),
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  EmployeeController.updateIntoDB,
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  EmployeeController.deleteFromDB,
);
router.post(
  '/create-employee',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  validateRequest(EmployeeValidation.create),
  EmployeeController.createEmployee,
);
router.post(
  '/create-power',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(EmployeeValidation.createPower),
  EmployeeController.createPower,
);

router.post(
  '/create-admin',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  validateRequest(EmployeeValidation.create),
  EmployeeController.createAdmin,
);

export const employeeRoutes = router;
