import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controlller';
import { ProductValidation } from './product.validation';

const router = express.Router();

router.post(
  '/create',
  validateRequest(ProductValidation.create),
  ProductController.insertIntoDB,
);

router.get('/', ProductController.getAllFromDB);

router.get('/:id', ProductController.getByIdFromDB);

export const productRoutes = router;
