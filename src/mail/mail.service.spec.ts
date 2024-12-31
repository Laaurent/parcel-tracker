import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { GmailClientService } from './gmail-client/gmail-client.service';
import { Mail } from './entities/mail.entities';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;

  const mockGmailClientService = {
    getMessageDetails: jest.fn(),
    getMessages: jest.fn(),
    getAllMessages: jest.fn(),
    getAttachments: jest.fn(),
    getAttachmentDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: GmailClientService,
          useValue: mockGmailClientService,
        },
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

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get message details', async () => {
    const messageId = '123';
    const messageDetails = { id: messageId } as Mail;
    mockGmailClientService.getMessageDetails.mockResolvedValue(messageDetails);

    const result = await service.getMessageDetails(messageId);
    expect(result).toEqual(messageDetails);
    expect(mockGmailClientService.getMessageDetails).toHaveBeenCalledWith(
      messageId,
    );
  });

  it('should get messages', async () => {
    const messages = [{ id: '123' }] as Mail[];
    mockGmailClientService.getMessages.mockResolvedValue(messages);
    mockGmailClientService.getMessageDetails.mockResolvedValue({ id: '123' });

    const result = await service.getMessages();
    expect(result).toEqual(messages);
    expect(mockGmailClientService.getMessages).toHaveBeenCalled();
  });

  it('should get all messages with query', async () => {
    const query = 'test';
    const messages = [{ id: '123' }] as Mail[];
    mockGmailClientService.getAllMessages.mockResolvedValue(messages);
    mockGmailClientService.getMessageDetails.mockResolvedValue({ id: '123' });

    const result = await service.getAllMessages(query);
    expect(result).toEqual(messages);
    expect(mockGmailClientService.getAllMessages).toHaveBeenCalledWith(query);
  });

  it('should get attachments', async () => {
    const messageId = '123';
    const attachments = [{ id: '456' }];
    mockGmailClientService.getAttachments.mockResolvedValue(attachments);

    const result = await service.getAttachments(messageId);
    expect(result).toEqual(attachments);
    expect(mockGmailClientService.getAttachments).toHaveBeenCalledWith(
      messageId,
    );
  });

  it('should get attachment details', async () => {
    const attachmentId = '456';
    const messageId = '123';
    const attachmentDetails = { id: attachmentId };
    mockGmailClientService.getAttachmentDetails.mockResolvedValue(
      attachmentDetails,
    );

    const result = await service.getAttachmentDetails(attachmentId, messageId);
    expect(result).toEqual(attachmentDetails);
    expect(mockGmailClientService.getAttachmentDetails).toHaveBeenCalledWith(
      attachmentId,
      messageId,
    );
  });

  it('should get invoices', async () => {
    const messages = [
      {
        id: '123',
        payload: { headers: [{ name: 'Subject', value: 'Invoice' }] },
        snippet: 'snippet',
        attachments: [],
      },
    ] as Mail[];
    mockGmailClientService.getAllMessages.mockResolvedValue(messages);
    mockGmailClientService.getMessageDetails.mockResolvedValue({ id: '123' });

    const result = await service.getInvoices();
    expect(result).toEqual([
      {
        id: '123',
        messageUrl: 'http://localhost:3000/mail/message/123',
        subject: 'Invoice',
        snippet: 'snippet',
        attachments: [],
      },
    ]);
    expect(mockGmailClientService.getAllMessages).toHaveBeenCalledWith(
      'has:attachment filename:pdf facture OR invoice OR receipt',
    );
  });
});
