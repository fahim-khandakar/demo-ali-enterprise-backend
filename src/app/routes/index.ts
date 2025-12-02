import express from 'express';
import { employeeRoutes } from '../modules/Employee/employee.routes';
import { AuthRoutes } from '../modules/auth/auth.route';
import { customerRoutes } from '../modules/customer/customer.routes';
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { orderRoutes } from '../modules/order/order.routes';
import { productRoutes } from '../modules/products/product.routes';
import { warehouseLogsRoutes } from '../modules/warehouse logs/warehouseLogs.routes';
import { warehouseProductRoutes } from '../modules/warehouse product/warehouseProduct.routes';
import { warehouseRoutes } from '../modules/warehouse/warehouse.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/',
    routes: AuthRoutes,
  },
  {
    path: '/user',
    routes: employeeRoutes,
  },
  {
    path: '/customer',
    routes: customerRoutes,
  },
  {
    path: '/products',
    routes: productRoutes,
  },
  {
    path: '/order',
    routes: orderRoutes,
  },
  {
    path: '/warehouse',
    routes: warehouseRoutes,
  },
  {
    path: '/warehouse-products',
    routes: warehouseProductRoutes,
  },
  {
    path: '/warehouse-logs',
    routes: warehouseLogsRoutes,
  },
  {
    path: '/dashboard',
    routes: dashboardRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.routes));
export default router;
