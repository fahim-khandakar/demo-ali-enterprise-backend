import { z } from 'zod';

const create = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'name is required',
      })
      .trim(),
  }),
});

const update = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'name is required',
      })
      .trim(),
  }),
});

export const warehouseValidations = {
  create,
  update,
};
