import express from 'express';
//
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { warehouseController } from './warehouse.controller';
import { warehouseValidations } from './warehouse.validation';

const router = express.Router();

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  warehouseController.getAllFromDB,
);

router.post(
  '/create',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),

  validateRequest(warehouseValidations.create),
  warehouseController.insertIntoDB,
);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),

  validateRequest(warehouseValidations.update),
  warehouseController.updateOneInDB,
);

export const warehouseRoutes = router;
