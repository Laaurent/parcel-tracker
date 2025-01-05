import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint pour rediriger l'utilisateur vers Google
  @Get('google')
  redirectToGoogle(@Res() res: Response) {
    const url = this.authService.getGoogleAuthUrl();
    res.redirect(url);
  }

  // Endpoint pour gérer le callback Google après authentification
  @Get('google/callback')
  async handleGoogleCallback(@Query('code') code: string) {
    const userData = await this.authService.handleGoogleCallback(code);
    return {
      message: 'Authentication successful',
      user: userData.userInfo,
      tokens: userData.tokens,
    };
  }
}
