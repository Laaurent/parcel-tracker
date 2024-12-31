import { Controller, Get, UseInterceptors, Param, Res } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { Mail } from './entities/mail.entities';

@Controller('mail')
@UseInterceptors(ResponseInterceptor)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('message/:messageId')
  async getMessageDetails(
    @Param('messageId') messageId: string,
  ): Promise<Mail> {
    return await this.mailService.getMessageDetails(messageId);
  }

  @Get('messages')
  async getMessages(): Promise<Mail[]> {
    return await this.mailService.getMessages();
  }

  @Get('invoices')
  async getInvoices(): Promise<Mail[]> {
    return await this.mailService.getInvoices();
  }

  @Get('message/:messageId/attachments')
  async getAttachments(@Param('messageId') messageId: string): Promise<any> {
    return await this.mailService.getAttachments(messageId);
  }

  @Get('message/:messageId/attachment/:attachmentId/')
  async getAttachmentDetails(
    @Param('attachmentId') attachmentId: string,
    @Param('messageId') messageId: string,
  ): Promise<any> {
    return await this.mailService.getAttachmentDetails(attachmentId, messageId);
  }

  @Get('message/:messageId/attachment/:attachmentId/download')
  async downloadAttachment(
    @Param('attachmentId') attachmentId: string,
    @Param('messageId') messageId: string,
    @Res() res,
  ) {
    const attachment = await this.mailService.getAttachmentDetails(
      attachmentId,
      messageId,
    );

    const buffer = Buffer.from(attachment.data, 'base64');
    const fileName = 'facture.pdf';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    res.send(buffer);
  }
}
