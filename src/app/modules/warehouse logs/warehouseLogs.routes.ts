import express from 'express';
//
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { warehouseLogsController } from './warehouseLogs.controller';
import { warehouseValidations } from './warehouseLogs.validation';

const router = express.Router();

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  warehouseLogsController.getAllFromDB,
);


router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),

  validateRequest(warehouseValidations.update),
  warehouseLogsController.updateOneInDB,
);

// router.delete(
//   '/:id',
//   auth(
//     ENUM_USER_ROLE.SUPER_ADMIN,
//     ENUM_USER_ROLE.ADMIN,
//   ),
//   warehouseLogsController.deleteByIdFromDB,
// );

export const warehouseLogsRoutes = router;
