import { Injectable, Logger } from '@nestjs/common';
const fs = require('fs').promises;
import * as path from 'path';
const {authenticate} = require('@google-cloud/local-auth');
import {google} from 'googleapis';

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService');
    private readonly SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
    private readonly TOKEN_PATH = path.join(process.cwd(), 'token.json');
    private readonly CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

    constructor() {
    }
    
    private async loadSavedCredentialsIfExist() {
        try {
          const content = await fs.readFile(this.TOKEN_PATH);
          const credentials = JSON.parse(content);
          return google.auth.fromJSON(credentials);
        } catch (err) {
          return null;
        }
    }
    
    private async saveCredentials(client) {
        const content = await fs.readFile(this.CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
          type: 'authorized_user',
          client_id: key.client_id,
          client_secret: key.client_secret,
          refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(this.TOKEN_PATH, payload);
    }
    
    private async authorize() {
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
          return client;
        }
        client = await authenticate({
          scopes: this.SCOPES,
          keyfilePath: this.CREDENTIALS_PATH,
        });
        if (client.credentials) {
          await this.saveCredentials(client);
        }
        return client;
    }

    async getAuthClient() {
        try{
            const authClient = await this.authorize();
            this.logger.log('Auth client created');
            return authClient;

        } catch (error) {
            this.logger.error('Error creating auth client');
            return null;
        }
    }
}
