import {
  Controller,
  Get,
  UseInterceptors,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { Mail } from './entities/mail.entities';
import { AuthGuard } from '../common/guards/auth.gard';

@Controller('mail')
@UseInterceptors(ResponseInterceptor)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(AuthGuard)
  @Get('/:userId/message/:messageId')
  async getMessageDetails(
    @Param('userId') userId: string,
    @Param('messageId') messageId: string,
  ): Promise<Mail> {
    return await this.mailService.getMessageDetails(userId, messageId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/messages')
  async getMessages(@Param('userId') userId: string): Promise<Mail[]> {
    return await this.mailService.getMessages(userId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/invoices')
  async getInvoices(@Param('userId') userId: string): Promise<Mail[]> {
    return await this.mailService.getInvoices(userId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/message/:messageId/attachments')
  async getAttachments(
    @Param('userId') userId: string,
    @Param('messageId') messageId: string,
  ): Promise<any> {
    return await this.mailService.getAttachments(userId, messageId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/message/:messageId/attachment/:attachmentId/')
  async getAttachmentDetails(
    @Param('userId') userId: string,
    @Param('attachmentId') attachmentId: string,
    @Param('messageId') messageId: string,
  ): Promise<any> {
    return await this.mailService.getAttachmentDetails(
      userId,
      attachmentId,
      messageId,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/message/:messageId/attachment/:attachmentId/download')
  async downloadAttachment(
    @Param('userId') userId: string,
    @Param('attachmentId') attachmentId: string,
    @Param('messageId') messageId: string,
    @Res() res,
  ) {
    const attachment = await this.mailService.getAttachmentDetails(
      userId,
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
