import { z } from 'zod';

const create = z.object({
  body: z.object({
    warehouseId: z.number({
      required_error: 'warehouse is required',
    }),
    customerId: z.number({
      required_error: 'customer  Cost is required',
    }),
    inchargeId: z.number({
      required_error: 'incharge is required',
    }),
    createdById: z.number({
      required_error: 'createdBy  is required',
    }),
    price: z.number().optional(),
    texPercentage: z.number().optional(),
    products: z.array(
      z.object({
        productId: z.number({
          required_error: 'product is required',
        }),
        quantity: z
          .number({
            required_error: 'quantity is required',
          })
          .min(1, { message: 'quantity must be at least 1' }),
      }),
    ),
  }),
});

export const orderValidation = {
  create,
};
