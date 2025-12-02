import prisma from '../../../shared/prisma';

export const getDashboardData = async () => {
  // === Stats ===
  const [
    totalUsers,
    totalCustomers,
    totalProducts,
    totalWarehouses,
    totalOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.product.count(),
    prisma.warehouse.count(),
    prisma.order.count(),
  ]);

  // === Orders by Month (full year) ===
  const ordersByMonth = await prisma.order.groupBy({
    by: ['createdAt'],
    _count: { id: true },
  });

  // Convert to Jan–Dec format
  const monthlyOrders = Array.from({ length: 12 }, (_, i) => {
    const count = ordersByMonth
      .filter(o => new Date(o.createdAt).getMonth() === i)
      .reduce((acc, o) => acc + (o._count?.id ?? 0), 0);

    return {
      month: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
      orders: count,
    };
  });

  // === Orders by Warehouse ===
  const ordersByWarehouse = await prisma.order.groupBy({
    by: ['warehouseId'],
    _count: { id: true },
  });

  const warehouses = await prisma.warehouse.findMany({
    select: { id: true, name: true },
  });

  const warehouseOrders = ordersByWarehouse.map(o => {
    const wh = warehouses.find(w => w.id === o.warehouseId);
    return { name: wh?.name || 'Unknown', value: o._count.id };
  });

  // === Top 5 Products (by order quantity) ===
  const topProducts = await prisma.orderProduct.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: topProducts.map(p => p.productId) } },
    select: { id: true, name: true },
  });

  const productSales = topProducts.map(tp => {
    const p = products.find(prod => prod.id === tp.productId);
    return {
      name: p?.name || 'Unknown',
      sales: tp._sum.quantity || 0,
    };
  });

  // === Recent Orders (last 5) ===
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      products: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  });

  return {
    stats: {
      totalUsers,
      totalCustomers,
      totalProducts,
      totalWarehouses,
      totalOrders,
    },
    charts: {
      monthlyOrders,
      warehouseOrders,
      productSales,
    },
    tables: {
      recentOrders,
    },
  };
};

export const DashboardService = {
  getDashboardData,
};
