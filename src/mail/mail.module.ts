import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { GmailClientService } from './gmail-client/gmail-client.service';
import { MailController } from './mail.controller';
import { AuthService } from 'src/auth/auth.service';
import { AttachmentService } from './gmail-client/attachment/attachment.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [MailService, GmailClientService, AuthService, AttachmentService],
  exports: [MailService],
  controllers: [MailController],
  imports: [ConfigModule],
})
export class MailModule {}
