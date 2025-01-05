import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { AuthTokenStore } from '../common/store/auth-token.store';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  private tokenStore = AuthTokenStore.getInstance();

  constructor(private readonly configService: ConfigService) {}

  private oauth2Client = new google.auth.OAuth2(
    this.configService.get('CLIENT_ID'),
    this.configService.get('CLIENT_SECRET'),
    this.configService.get('REDIRECT_URI'),
  );

  // Générer l'URL pour l'authentification Google
  getGoogleAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    });
  }

  // Gérer le callback Google avec le code reçu
  async handleGoogleCallback(
    code: string,
  ): Promise<{ tokens: any; userInfo: any }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const userId = userInfo.data.id; // Utilisez l'ID Google comme identifiant utilisateur

    this.tokenStore.setToken(userId, tokens); // Stockez les tokens

    return {
      tokens,
      userInfo: userInfo.data,
    };
  }

  getUserTokens(userId: string): any | null {
    return this.tokenStore.getToken(userId);
  }
}
