import { Test, TestingModule } from '@nestjs/testing';
import { GmailClientService } from './gmail-client.service';
import { AuthService } from '../../auth/auth.service';
import { AttachmentService } from './attachment/attachment.service';
import { google } from 'googleapis';

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    gmail: jest.fn().mockReturnValue({
      users: {
        messages: {
          list: jest.fn(),
          get: jest.fn(),
          attachments: {
            get: jest.fn(),
          },
        },
      },
    }),
  },
}));

describe('GmailClientService', () => {
  let service: GmailClientService;
  let authService: AuthService;
  let attachmentService: AttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailClientService,
        {
          provide: AuthService,
          useValue: {
            getUserTokens: jest.fn(),
          },
        },
        {
          provide: AttachmentService,
          useValue: {
            lookUpAttachements: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GmailClientService>(GmailClientService);
    authService = module.get<AuthService>(AuthService);
    attachmentService = module.get<AttachmentService>(AttachmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessages', () => {
    it('should return messages', async () => {
      const userId = 'test-user';
      const query = 'test-query';
      const mockMessages = [{ id: '1' }, { id: '2' }];
      const oauth2Client = new google.auth.OAuth2();
      const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
      (gmailClient.users.messages.list as jest.Mock).mockResolvedValue({
        data: { messages: mockMessages },
      });

      jest.spyOn(service, '_init').mockResolvedValue(gmailClient);

      const result = await service.getMessages(userId, query);
      expect(result).toEqual(mockMessages);
      expect(gmailClient.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        q: query,
        maxResults: 100,
      });
    });
  });

  describe('getAttachments', () => {
    it('should return attachments', async () => {
      const userId = '123';
      const messageId = 'test-message';
      const mockMessage = { payload: {} };
      const oauth2Client = new google.auth.OAuth2();
      const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
      (gmailClient.users.messages.get as jest.Mock).mockResolvedValue({
        data: mockMessage,
      });

      jest.spyOn(service, '_init').mockResolvedValue(gmailClient);
      jest
        .spyOn(attachmentService, 'lookUpAttachements')
        .mockResolvedValue([] as never);

      const result = await service.getAttachments(userId, messageId);
      expect(result).toEqual([]);
      expect(gmailClient.users.messages.get).toHaveBeenCalledWith({
        userId: 'me',
        id: messageId,
      });
      expect(attachmentService.lookUpAttachements).toHaveBeenCalledWith(
        userId,
        messageId,
        mockMessage.payload,
      );
    });
  });

  describe('getAttachmentDetails', () => {
    it('should return attachment details', async () => {
      const userId = 'test-user';
      const attachmentId = 'test-attachment';
      const messageId = 'test-message';
      const mockAttachment = { data: 'attachment-data' };
      const oauth2Client = new google.auth.OAuth2();
      const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
      (
        gmailClient.users.messages.attachments.get as jest.Mock
      ).mockResolvedValue({
        data: mockAttachment,
      });

      jest.spyOn(service, '_init').mockResolvedValue(gmailClient);

      const result = await service.getAttachmentDetails(
        userId,
        attachmentId,
        messageId,
      );
      expect(result).toEqual(mockAttachment);
      expect(gmailClient.users.messages.attachments.get).toHaveBeenCalledWith({
        userId: 'me',
        messageId,
        id: attachmentId,
      });
    });
  });

  describe('getAllMessages', () => {
    it('should return all messages', async () => {
      const userId = 'test-user';
      const query = 'test-query';
      const mockMessages = [{ id: '1' }, { id: '2' }];
      const oauth2Client = new google.auth.OAuth2();
      const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
      (gmailClient.users.messages.list as jest.Mock).mockResolvedValueOnce({
        data: { messages: mockMessages, nextPageToken: 'next-page-token' },
      });
      (gmailClient.users.messages.list as jest.Mock).mockResolvedValueOnce({
        data: { messages: mockMessages, nextPageToken: null },
      });

      jest.spyOn(service, '_init').mockResolvedValue(gmailClient);

      const result = await service.getAllMessages(userId, query);
      expect(result).toEqual([...mockMessages, ...mockMessages]);
      expect(gmailClient.users.messages.list).toHaveBeenCalledTimes(3);
      expect(gmailClient.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        q: query,
        pageToken: null,
        maxResults: 100,
      });
      expect(gmailClient.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        q: query,
        pageToken: 'next-page-token',
        maxResults: 100,
      });
    });
  });

  describe('getMessageDetails', () => {
    it('should return message details without attachments', async () => {
      const userId = 'test-user';
      const messageId = 'test-message';
      const mockMessage = { id: '1', payload: {} };
      const oauth2Client = new google.auth.OAuth2();
      const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
      (gmailClient.users.messages.get as jest.Mock).mockResolvedValue({
        data: mockMessage,
      });

      jest.spyOn(service, '_init').mockResolvedValue(gmailClient);

      const result = await service.getMessageDetails(userId, messageId, false);
      expect(result).toEqual({ ...mockMessage, attachments: [] });
      expect(gmailClient.users.messages.get).toHaveBeenCalledWith({
        userId: 'me',
        id: messageId,
      });
    });
  });

  describe('getAuthorizedClient', () => {
    it('should return authorized Gmail client', () => {
      const tokens = { access_token: 'test-token' };
      const oauth2Client = new google.auth.OAuth2();
      const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });

      jest.spyOn(oauth2Client, 'setCredentials');
      jest.spyOn(google, 'gmail').mockReturnValue(gmailClient);

      const result = service.getAuthorizedClient(tokens);
      expect(result).toEqual(gmailClient);
      expect(google.gmail).toHaveBeenCalledWith({
        version: 'v1',
        auth: oauth2Client,
      });
    });
  });

  describe('_init', () => {
    it('should initialize Gmail client', async () => {
      const userId = 'test-user';
      const tokens = { access_token: 'test-token' };
      const oauth2Client = new google.auth.OAuth2();
      const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });

      jest.spyOn(authService, 'getUserTokens').mockReturnValue(tokens);
      jest.spyOn(service, 'getAuthorizedClient').mockReturnValue(gmailClient);

      const result = await service._init(userId);
      expect(result).toEqual(gmailClient);
      expect(authService.getUserTokens).toHaveBeenCalledWith(userId);
      expect(service.getAuthorizedClient).toHaveBeenCalledWith(tokens);
    });

    it('should throw error if tokens not found', async () => {
      const userId = 'test-user';

      jest.spyOn(authService, 'getUserTokens').mockReturnValue(null);

      await expect(service._init(userId)).rejects.toThrow(
        'User tokens not found',
      );
    });
  });
});
