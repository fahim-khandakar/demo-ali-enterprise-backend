import express from 'express';
//
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router
  .post(
    '/login',
    validateRequest(AuthValidation.loginZodSchema),
    AuthController.loginUser,
  )
  .post('/email-verify', AuthController.verifyEmail)
  .post(
    '/resend-verification-mail',
    validateRequest(AuthValidation.resendVerificationMailSchema),
    AuthController.resendVerificationMail,
  );

router.post('/reset-password', AuthController.resetPassword);

export const AuthRoutes = router;
