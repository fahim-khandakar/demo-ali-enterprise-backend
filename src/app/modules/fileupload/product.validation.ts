import { z } from 'zod';

const create = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
    }),
    brand: z.string({
      required_error: 'brand is required',
    }),
    purchaseCost: z.number({
      required_error: 'purchase Cost is required',
    }),
    unit: z.string({
      required_error: 'unit is required',
    }),
    remainderQty: z.number({
      required_error: 'remainder qty  is required',
    }),
  }),
});

export const ProductValidation = {
  create,
};
