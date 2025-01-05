import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');

  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    this.logger.log('Executing AuthGuard');
    const request = context.switchToHttp().getRequest();
    const userId = request.params.userId;

    const tokens = this.authService.getUserTokens(userId);

    if (!tokens) {
      throw new Error('User tokens not found');
    }
    return !!tokens;
  }
}
