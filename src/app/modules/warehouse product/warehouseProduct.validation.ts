import { z } from 'zod';

const productSchema = z.object({
  warehouseId: z.string({
    required_error: 'warehouseId is required',
  }),
  productId: z.string({
    required_error: 'productId is required',
  }),
  quantity: z
    .string({
      required_error: 'quantity is required',
    })
    .min(1, { message: 'quantity must be at least 1' }),
});

const create = z.object({
  body: z.array(productSchema),
});
const update = z.object({
  body: z.object({
    warehouseId: z.number({
      required_error: 'warehouseId is required',
    }),
    productId: z.number({
      required_error: 'productId is required',
    }),
    quantity: z
      .number({
        required_error: 'quantity is required',
      })
      .min(1, { message: 'quantity must be at least 1' }),
  }),
});

const productFileUploadSchema = z.object({
  warehouseId: z.number({
    required_error: 'warehouseId is required',
  }),
  name: z.string({
    required_error: 'product name is required',
  }),
  brand: z.string({
    required_error: 'product brand is required',
  }),
  quantity: z.number({
    required_error: 'quantity is required',
  }),
});

const create_multiple = z.object({
  body: z.array(productFileUploadSchema),
});
const check = z.object({
  body: z.object({
    warehouseId: z.string({
      required_error: 'warehouseId is required',
    }),
    productId: z.string({
      required_error: 'productId is required',
    }),
    quantity: z.number({
      required_error: 'quantity is required',
    }),
  }),
});

export const warehouseProductValidation = {
  create,
  check,
  update,
  create_multiple,
};
