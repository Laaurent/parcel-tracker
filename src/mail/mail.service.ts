import { Injectable, Logger } from '@nestjs/common';
import { GmailClientService } from './gmail-client/gmail-client.service';
import { Mail } from './entities/mail.entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly baseUrl = this.configService.get('APP_BASE_URL');

  constructor(
    private readonly gmailClientService: GmailClientService,
    private readonly configService: ConfigService,
  ) {}

  async getMessageDetails(userId: string, messageId: string): Promise<Mail> {
    this.logger.debug(`Getting details for message ${messageId}`);

    return await this.gmailClientService.getMessageDetails(userId, messageId);
  }

  async getMessages(userId: string): Promise<Mail[]> {
    this.logger.debug('Getting messages');

    const messages = await this.gmailClientService.getMessages(userId);

    return await this.getDetailedMessages(userId, messages);
  }

  async getAllMessages(userId: string, query: string = ''): Promise<Mail[]> {
    this.logger.debug(`Getting all messages with query : ${query}`);

    const messages = await this.gmailClientService.getAllMessages(
      userId,
      query,
    );

    return await this.getDetailedMessages(userId, messages);
  }

  async getAttachments(userId: string, messageId: string): Promise<any> {
    this.logger.debug(`Getting attachments for message ${messageId}`);

    return await this.gmailClientService.getAttachments(userId, messageId);
  }

  async getAttachmentDetails(
    userId: string,
    attachmentId: string,
    messageId: string,
  ): Promise<any> {
    this.logger.debug(
      `Getting details for attachment ${attachmentId} in message ${messageId}`,
    );

    return await this.gmailClientService.getAttachmentDetails(
      userId,
      attachmentId,
      messageId,
    );
  }

  async getInvoices(userId: string): Promise<Mail[]> {
    this.logger.debug('Getting invoices');

    const messages = await this.gmailClientService.getAllMessages(
      userId,
      'has:attachment filename:pdf facture OR invoice OR receipt',
    );

    const detailedMessages = await this.getDetailedMessages(
      userId,
      messages,
      true,
    );

    return detailedMessages.map((msg: Mail) => ({
      id: msg.id,
      messageUrl: `${this.baseUrl}/mail/${userId}/message/${msg.id}`,
      subject: msg.payload.headers.find((h) => h.name === 'Subject')?.value,
      snippet: msg.snippet,
      attachments: msg.attachments,
    }));
  }

  public async getDetailedMessages(
    userId: string,
    messages: Mail[],
    withAttachments = false,
  ): Promise<Mail[]> {
    this.logger.debug('Getting detailed messages');

    return await Promise.all(
      messages.map(async (msg: Mail) => {
        const messageDetails = await this.gmailClientService.getMessageDetails(
          userId,
          msg.id,
          withAttachments,
        );
        return { ...msg, ...messageDetails };
      }),
    );
  }
}
