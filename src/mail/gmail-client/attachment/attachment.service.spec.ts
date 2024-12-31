import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { Payload } from 'src/mail/entities/mail.entities';
import { ConfigService } from '@nestjs/config';

describe('AttachmentService', () => {
  let service: AttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'APP_BASE_URL':
                  return 'http://localhost:3000';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array if payload has no parts', () => {
    const payload: Payload = { parts: null };
    const result = service.lookUpAttachements('messageId', payload);
    expect(result).toEqual([]);
  });

  it('should return attachments if payload has parts with filenames', () => {
    const payload: Payload = {
      parts: [
        {
          partId: '1',
          filename: 'file1.txt',
          mimeType: 'text/plain',
          body: { attachmentId: '123', size: 100, data: 'data' },
        },
        {
          partId: '2',
          filename: 'file2.jpg',
          mimeType: 'image/jpeg',
          body: { attachmentId: '456', size: 200, data: 'data' },
        },
      ],
    };
    const result = service.lookUpAttachements('messageId', payload);
    expect(result).toEqual([
      {
        attachmentId: '123',
        filename: 'file1.txt',
        mimeType: 'text/plain',
        attachmentUrl:
          'http://localhost:3000/mail/message/messageId/attachment/123',
        attachementDownloadUrl:
          'http://localhost:3000/mail/message/messageId/attachment/123/download',
      },
      {
        attachmentId: '456',
        filename: 'file2.jpg',
        mimeType: 'image/jpeg',
        attachmentUrl:
          'http://localhost:3000/mail/message/messageId/attachment/456',
        attachementDownloadUrl:
          'http://localhost:3000/mail/message/messageId/attachment/456/download',
      },
    ]);
  });

  it('should filter out parts without filenames', () => {
    const payload: Payload = {
      parts: [
        {
          partId: '1',
          filename: 'file1.txt',
          mimeType: 'text/plain',
          body: { attachmentId: '123', size: 100, data: 'data' },
        },
        {
          partId: '2',
          filename: '',
          mimeType: 'image/jpeg',
          body: { attachmentId: '456', size: 200, data: 'data' },
        },
      ],
    };
    const result = service.lookUpAttachements('messageId', payload);
    expect(result).toEqual([
      {
        attachmentId: '123',
        filename: 'file1.txt',
        mimeType: 'text/plain',
        attachmentUrl:
          'http://localhost:3000/mail/message/messageId/attachment/123',
        attachementDownloadUrl:
          'http://localhost:3000/mail/message/messageId/attachment/123/download',
      },
    ]);
  });

  it('should log a debug message when looking up attachments', () => {
    const loggerSpy = jest.spyOn(service['logger'], 'debug');
    const payload: Payload = { parts: null };
    service.lookUpAttachements('messageId', payload);
    expect(loggerSpy).toHaveBeenCalledWith(
      'Looking up attachments for message messageId',
    );
  });
});
