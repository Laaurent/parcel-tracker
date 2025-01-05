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

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: GmailClientService, useValue: mockGmailClientService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get message details', async () => {
    const userId = 'user1';
    const messageId = 'message1';
    const messageDetails = { id: messageId } as Mail;
    mockGmailClientService.getMessageDetails.mockResolvedValue(messageDetails);

    const result = await service.getMessageDetails(userId, messageId);

    expect(result).toEqual(messageDetails);
    expect(mockGmailClientService.getMessageDetails).toHaveBeenCalledWith(
      userId,
      messageId,
    );
  });

  it('should get messages', async () => {
    const userId = 'user1';
    const messages = [{ id: 'message1' }] as Mail[];
    mockGmailClientService.getMessages.mockResolvedValue(messages);
    jest.spyOn(service, 'getDetailedMessages').mockResolvedValue(messages);

    const result = await service.getMessages(userId);

    expect(result).toEqual(messages);
    expect(mockGmailClientService.getMessages).toHaveBeenCalledWith(userId);
    expect(service.getDetailedMessages).toHaveBeenCalledWith(userId, messages);
  });

  it('should get all messages with query', async () => {
    const userId = 'user1';
    const query = 'test';
    const messages = [{ id: 'message1' }] as Mail[];
    mockGmailClientService.getAllMessages.mockResolvedValue(messages);
    jest.spyOn(service, 'getDetailedMessages').mockResolvedValue(messages);

    const result = await service.getAllMessages(userId, query);

    expect(result).toEqual(messages);
    expect(mockGmailClientService.getAllMessages).toHaveBeenCalledWith(
      userId,
      query,
    );
    expect(service.getDetailedMessages).toHaveBeenCalledWith(userId, messages);
  });

  it('should get attachments', async () => {
    const userId = 'user1';
    const messageId = 'message1';
    const attachments = [{ id: 'attachment1' }];
    mockGmailClientService.getAttachments.mockResolvedValue(attachments);

    const result = await service.getAttachments(userId, messageId);

    expect(result).toEqual(attachments);
    expect(mockGmailClientService.getAttachments).toHaveBeenCalledWith(
      userId,
      messageId,
    );
  });

  it('should get attachment details', async () => {
    const userId = 'user1';
    const attachmentId = 'attachment1';
    const messageId = 'message1';
    const attachmentDetails = { id: attachmentId };
    mockGmailClientService.getAttachmentDetails.mockResolvedValue(
      attachmentDetails,
    );

    const result = await service.getAttachmentDetails(
      userId,
      attachmentId,
      messageId,
    );

    expect(result).toEqual(attachmentDetails);
    expect(mockGmailClientService.getAttachmentDetails).toHaveBeenCalledWith(
      userId,
      attachmentId,
      messageId,
    );
  });

  it('should get invoices', async () => {
    const userId = 'user1';
    const messages = [
      {
        id: 'message1',
        payload: { headers: [{ name: 'Subject', value: 'Invoice' }] },
        snippet: 'snippet',
        attachments: [],
      },
    ] as Mail[];
    mockGmailClientService.getAllMessages.mockResolvedValue(messages);
    jest.spyOn(service, 'getDetailedMessages').mockResolvedValue(messages);

    const result = await service.getInvoices(userId);

    expect(result).toEqual([
      {
        id: 'message1',
        messageUrl: 'http://localhost:3000/mail/message/message1',
        subject: 'Invoice',
        snippet: 'snippet',
        attachments: [],
      },
    ]);
    expect(mockGmailClientService.getAllMessages).toHaveBeenCalledWith(
      userId,
      'has:attachment filename:pdf facture OR invoice OR receipt',
    );
    expect(service.getDetailedMessages).toHaveBeenCalledWith(
      userId,
      messages,
      true,
    );
  });
});
