import bcrypt from 'bcryptjs';
import config from '../config';
import { ENUM_USER_ROLE } from '../enums/user';
import prisma from '../shared/prisma';

const allPowers = ['PRODUCT_BUY', 'INVENTORY', 'PRODUCT_SELL'] as const;

export const seedSuperAdmin = async () => {
  // check if super admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: config.admin.superAdmin },
    include: { details: true },
  });
  if (existing) {
    console.log('Super admin already exists.');
    return;
  }

  // seed powers
  const powers = await Promise.all(
    allPowers.map(async power =>
      prisma.power.upsert({
        where: { name: power },
        update: {},
        create: { name: power },
      }),
    ),
  );

  // hash password
  const hashedPassword = await bcrypt.hash(
    config.admin.superAdminPass as string,
    Number(config.bcrypt_salt_rounds),
  );

  // create super admin + details + attach powers
  const superAdmin = await prisma.user.create({
    data: {
      email: config.admin.superAdmin as string,
      password: hashedPassword,
      role: ENUM_USER_ROLE.SUPER_ADMIN,
      details: {
        create: {
          name: 'Super Admin',
          email: config.admin.superAdmin as string,
          designation: 'System Owner',
          role: ENUM_USER_ROLE.SUPER_ADMIN,
          contactNo: '01903994195',
          profileImage: '',
          verified: true,
          status: true,
          powers: {
            connect: powers.map(p => ({ id: p.id })),
          },
        },
      },
    },
    include: { details: { include: { powers: true } } },
  });

  console.log(
    '✅ Super Admin created successfully with powers:',
    superAdmin.details?.powers.map(p => p.name),
  );
};
