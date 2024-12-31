import { Injectable, Logger } from '@nestjs/common';
const { google } = require('googleapis');
import { AuthService } from '../../auth/auth.service';
import { Mail } from '../entities/mail.entities';
import { AttachmentService } from './attachment/attachment.service';
import { StateManagerRx } from 'src/state/state-manager-rx';

@Injectable()
export class GmailClientService {
  private gmail: any;
  private readonly logger = new Logger('GmailClientService');

  private stateManager = StateManagerRx.getInstance();

  constructor(
    private readonly authService: AuthService,
    private readonly attachmentService: AttachmentService,
  ) {}

  async getMessages(query: string = ''): Promise<Mail[]> {
    if (!this.gmail) {
      await this._init();
    }
    this.logger.debug(`Getting messages with query : ${query}`);

    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100,
    });
    return response.data.messages || [];
  }

  async getAttachments(messageId: string): Promise<any> {
    if (!this.gmail) {
      await this._init();
    }
    this.logger.debug(`Getting attachments for message ${messageId}`);

    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const message = response.data;
    return this.attachmentService.lookUpAttachements(
      messageId,
      message.payload,
    );
  }

  async getAttachmentDetails(
    attachmentId: string,
    messageId: string,
  ): Promise<any> {
    if (!this.gmail) {
      await this._init();
    }
    this.logger.debug(
      `Getting details for attachment ${attachmentId} in message ${messageId}`,
    );

    const response = await this.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });
    return response.data;
  }

  async getAllMessages(query: string = ''): Promise<Mail[]> {
    if (!this.gmail) {
      await this._init();
    }

    this.logger.debug(`Getting all messages with query : ${query}`);

    let allMessages = [];
    let nextPageToken = null;

    do {
      const response = await this.gmail.users.messages.list({
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
    messageId: string,
    withAttachments = false,
  ): Promise<Mail> {
    if (!this.gmail) {
      await this._init();
    }

    this.logger.debug(`Getting message details for message ${messageId}`);

    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const message = response.data;
    const attachments = withAttachments
      ? this.attachmentService.lookUpAttachements(messageId, message.payload)
      : [];

    return { ...message, attachments };
  }

  async _init(): Promise<void> {
    this.logger.log('Creating Gmail client');
    try {
      const authClient = await this.authService.getAuthClient();
      if (!authClient) {
        throw new Error('Utilisateur non authentifié');
      }
      this.gmail = google.gmail({ version: 'v1', auth: authClient });
      this.logger.log('Gmail client created');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
