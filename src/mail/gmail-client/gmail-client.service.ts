import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { AuthService } from '../../auth/auth.service';
import { Mail } from '../entities/mail.entities';
import { AttachmentService } from './attachment/attachment.service';

@Injectable()
export class GmailClientService {
  private readonly logger = new Logger('GmailClientService');

  constructor(
    private readonly authService: AuthService,
    private readonly attachmentService: AttachmentService,
  ) {}

  async getMessages(userId: string, query: string = ''): Promise<Mail[]> {
    const gmailClient = await this._init(userId);
    this.logger.debug(`Getting messages with query : ${query}`);

    const response = await gmailClient.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100,
    });
    return response.data.messages || [];
  }

  async getAttachments(userId: string, messageId: string): Promise<any> {
    const gmailClient = await this._init(userId);

    this.logger.debug(`Getting attachments for message ${messageId}`);

    const response = await gmailClient.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const message = response.data;
    return this.attachmentService.lookUpAttachements(
      userId,
      messageId,
      message.payload,
    );
  }

  async getAttachmentDetails(
    userId: string,
    attachmentId: string,
    messageId: string,
  ): Promise<any> {
    const gmailClient = await this._init(userId);

    this.logger.debug(
      `Getting details for attachment ${attachmentId} in message ${messageId}`,
    );

    const response = await gmailClient.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });
    return response.data;
  }

  async getAllMessages(userId: string, query: string = ''): Promise<Mail[]> {
    const gmailClient = await this._init(userId);

    this.logger.debug(`Getting all messages with query : ${query}`);

    let allMessages = [];
    let nextPageToken = null;

    do {
      const response = await gmailClient.users.messages.list({
        userId: 'me',
        q: query,
        pageToken: nextPageToken,
        maxResults: 100,
      });

      const messages = response.data.messages || [];
      allMessages = allMessages.concat(messages);
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return allMessages;
  }

  async getMessageDetails(
    userId: string,
    messageId: string,
    withAttachments = false,
  ): Promise<Mail> {
    const gmailClient = await this._init(userId);

    this.logger.debug(`Getting message details for message ${messageId}`);

    const response = await gmailClient.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const message = response.data;
    const attachments = withAttachments
      ? this.attachmentService.lookUpAttachements(
          userId,
          messageId,
          message.payload,
        )
      : [];

    return { ...message, attachments };
  }

  public getAuthorizedClient(tokens: any): any {
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );

    oauth2Client.setCredentials(tokens);

    this.logger.log('Gmail client created');
    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async _init(userId: string): Promise<any> {
    this.logger.log('Creating Gmail client');
    try {
      // Obtenez les tokens pour l'utilisateur depuis le AuthService
      const tokens = this.authService.getUserTokens(userId);

      /* 100765374900384800587*/
      if (!tokens) {
        throw new Error('User tokens not found');
      }

      // Initialisez le client Gmail avec les tokens
      return this.getAuthorizedClient(tokens);
    } catch (err) {
      throw new Error(`Failed to initialize Gmail client: ${err.message}`);
    }
  }
}
