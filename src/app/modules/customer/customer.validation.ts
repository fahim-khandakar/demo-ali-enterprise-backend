import { z } from 'zod';

const create = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
    }),
    email: z.string({
      required_error: 'email is required',
    }),
    contactNo: z.string({
      required_error: 'contact No. Cost is required',
    }),
    profileImage: z.string().optional(),
  }),
});
const update = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    contactNo: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});

export const customerValidation = {
  create,
  update,
};
