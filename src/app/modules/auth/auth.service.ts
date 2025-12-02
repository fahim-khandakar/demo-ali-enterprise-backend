import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
//
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import {
  generateVerificationCode,
  sendVerificationEmail,
  storeVerificationCode,
} from '../../../helpers/Email Helpers/Helpers/emailverify';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import { ILoginUser, ILoginUserResponse } from './auth.interface';
import { isPasswordMatched, isUserExist } from './auth.utils';

async function loginUser(payload: ILoginUser): Promise<ILoginUserResponse> {
  const { email: userEmail, password } = payload;

  const user = await isUserExist(userEmail);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (!user?.verified) {
    throw new ApiError(403, 'Your account is not verified');
  }
  if (!user?.status) {
    throw new ApiError(403, 'Your account is deactivated');
  }

  if (user.password && !(await isPasswordMatched(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  const { id, email, role, powers } = user;

  const secret = config.jwt.secret;

  if (!secret) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'secret is not defined');
  }

  const accessToken = jwt.sign({ id, email, role, powers }, secret, {
    expiresIn: config.jwt.expires_in,
  });

  const refreshToken = jwt.sign({ id, email, role, powers }, secret, {
    expiresIn: config.jwt.refresh_expires_in,
  });

  return {
    accessToken,
    refreshToken,
  };
}

const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  const { email, newPassword } = payload;

  // Find the user by id
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found!');
  }

  const isVerified = await jwtHelpers.verifyToken(
    token,
    config.jwt.secret as string,
  );

  if (!isVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token verification failed!');
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  // Update the user's password
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
};

const updateVerificationStatus = async (email: string, verified: boolean) => {
  const result = await prisma.userDetails.updateMany({
    where: { email },
    data: { verified, status: true },
  });
  return result;
};

const resendVerificationMail = async (id: number) => {
  const result = await prisma.userDetails.findUnique({
    where: {
      id: id,
    },
  });

  if (!result) {
    throw new ApiError(400, 'user not found');
  }

  if (result.verified) {
    throw new ApiError(400, 'User already verified');
  }

  const { email } = result;

  const verificationCode = generateVerificationCode();
  storeVerificationCode(email, verificationCode);
  await sendVerificationEmail(email, verificationCode);
  return {
    email: result.email,
    resend: true,
  };
};

export const AuthService = {
  loginUser,
  resetPassword,
  updateVerificationStatus,
  resendVerificationMail,
};
