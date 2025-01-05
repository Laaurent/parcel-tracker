import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getGoogleAuthUrl: jest
              .fn()
              .mockReturnValue('http://google.com/auth'),
            handleGoogleCallback: jest.fn().mockResolvedValue({
              userInfo: { id: '123', name: 'Test User' },
              tokens: {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
              },
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('redirectToGoogle', () => {
    it('should redirect to Google auth URL', () => {
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      authController.redirectToGoogle(res);

      expect(authService.getGoogleAuthUrl).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('http://google.com/auth');
    });
  });

  describe('handleGoogleCallback', () => {
    it('should handle Google callback and return user data', async () => {
      const code = 'auth-code';
      const result = await authController.handleGoogleCallback(code);

      expect(authService.handleGoogleCallback).toHaveBeenCalledWith(code);
      expect(result).toEqual({
        message: 'Authentication successful',
        user: { id: '123', name: 'Test User' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      });
    });
  });
});
