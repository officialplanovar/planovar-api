import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.config';

const handler = toNodeHandler(auth);

// All /api/auth/* routes are delegated entirely to Better Auth.
// This covers: sign-up, sign-in, sign-out, OTP, Google OAuth, session, etc.
@Controller('api/auth')
export class AuthController {
  @All('*path')
  async handle(@Req() req: Request, @Res() res: Response) {
    return handler(req, res);
  }
}
