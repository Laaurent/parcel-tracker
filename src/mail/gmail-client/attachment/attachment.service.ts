import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from 'src/mail/entities/mail.entities';

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger('AttachmentService');

  private readonly baseUrl = `${this.configService.get('APP_PROTOCOL')}://${this.configService.get('APP_HOST')}:${this.configService.get('APP_PORT')}`;

  constructor(private configService: ConfigService) {}

  lookUpAttachements(messageId: string, payload: Payload): Payload[] {
    this.logger.debug(`Looking up attachments for message ${messageId}`);

    if (!payload?.parts) {
      return [];
    }

    return payload.parts
      .filter((part) => part.filename)
      .map((part) => ({
        attachmentId: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        attachmentUrl: `${this.baseUrl}/mail/message/${messageId}/attachment/${part.body.attachmentId}`,
        attachementDownloadUrl: `${this.baseUrl}/mail/message/${messageId}/attachment/${part.body.attachmentId}/download`,
      }));
  }
}
