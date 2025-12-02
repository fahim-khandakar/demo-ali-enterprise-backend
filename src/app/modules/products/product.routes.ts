import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controlller';
import { ProductValidation } from './product.validation';

const router = express.Router();

router.post(
  '/create',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  validateRequest(ProductValidation.create),
  ProductController.insertIntoDB,
);
router.post(
  '/create-multiple',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  validateRequest(ProductValidation.fileUpload),
  ProductController.FileInsertIntoDB,
);

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  ProductController.getAllFromDB,
);
router.get(
  '/remainder-count',
  // auth(
  //   ENUM_USER_ROLE.SUPER_ADMIN,
  //   ENUM_USER_ROLE.ADMIN,
  //   ENUM_USER_ROLE.EMPLOYEE,
  // ),
  ProductController.getRemainderCountFromDB,
);
router.get(
  '/remainder',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  ProductController.getRemainderFromDB,
);
router.get(
  '/empty',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  ProductController.getEmptyFromDB,
);

router.get(
  '/inventory',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  ProductController.getInventoryReportFromDB,
);
router.get(
  '/available',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  ProductController.getAvailableFromDB,
);
router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  ProductController.getByIdFromDB,
);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.EMPLOYEE,
  ),
  validateRequest(ProductValidation.update),
  ProductController.updateOneInDB,
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  ProductController.deleteByIdFromDB,
);

export const productRoutes = router;
