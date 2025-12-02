import { z } from 'zod';

const productSchema = z.object({
  name: z
    .string({
      required_error: 'name is required',
    })
    .trim(),
  brand: z
    .string({
      required_error: 'brand is required',
    })
    .trim(),
  purchaseCost: z.number({
    required_error: 'purchase Cost is required',
  }),
  unit: z.string({
    required_error: 'unit is required',
  }),
  remainderQty: z.number({
    required_error: 'remainder qty is required',
  }),
});

const create = z.object({
  body: productSchema,
});

const fileUpload = z.object({
  body: z.array(productSchema),
});

const update = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    purchaseCost: z.number().optional(),
    unit: z.string().optional(),
    remainderQty: z.number().optional(),
  }),
});

export const ProductValidation = {
  create,
  update,
  fileUpload,
};
