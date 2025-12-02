import { z } from 'zod';

const update = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    profileImage: z.string().optional(),
    contactNo: z.string().optional(),
    designation: z.string().optional(),
    powerId: z.array(z.number().optional()),
  }),
});
const create = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
    }),
    email: z
      .string({
        required_error: 'email is required',
      })
      .email(),
    profileImage: z.string({
      required_error: 'Profile image is required',
    }),
    contactNo: z.string({
      required_error: 'Contact no is required',
    }),
    designation: z.string({
      required_error: 'designation is required',
    }),
    powerId: z.array(
      z.number({
        required_error: 'power is required',
      }),
    ),
  }),
});
const createPower = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name is required',
    }),
  }),
});

export const EmployeeValidation = {
  update,
  create,
  createPower,
};
