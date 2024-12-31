import { Test, TestingModule } from '@nestjs/testing';
import { GmailClientService } from './gmail-client.service';
import { AuthService } from '../../auth/auth.service';
import { AttachmentService } from './attachment/attachment.service';

describe('GmailClientService', () => {
  let service: GmailClientService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailClientService,
        {
          provide: AuthService,
          useValue: {
            getAuthClient: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: AttachmentService,
          useValue: {
            lookUpAttachements: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<GmailClientService>(GmailClientService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize gmail client', async () => {
    const spy = jest.spyOn(authService, 'getAuthClient');
    await service['_init']();
    expect(spy).toHaveBeenCalled();
    expect(service['gmail']).toBeDefined();
  });

  it('should get messages', async () => {
    service['gmail'] = {
      users: {
        messages: {
          list: jest.fn().mockResolvedValue({ data: { messages: [] } }),
        },
      },
    };
    const messages = await service.getMessages();
    expect(messages).toEqual([]);
  });

  it('should get attachments', async () => {
    service['gmail'] = {
      users: {
        messages: {
          get: jest.fn().mockResolvedValue({ data: {} }),
        },
      },
    };
    const attachments = await service.getAttachments('messageId');
    expect(attachments).toEqual([]);
  });

  it('should get attachment details', async () => {
    service['gmail'] = {
      users: {
        messages: {
          attachments: {
            get: jest.fn().mockResolvedValue({ data: {} }),
          },
        },
      },
    };
    const attachmentDetails = await service.getAttachmentDetails(
      'attachmentId',
      'messageId',
    );
    expect(attachmentDetails).toEqual({});
  });

  it('should get all messages', async () => {
    service['gmail'] = {
      users: {
        messages: {
          list: jest.fn().mockResolvedValue({
            data: { messages: [], nextPageToken: null },
          }),
        },
      },
    };
    const messages = await service.getAllMessages();
    expect(messages).toEqual([]);
  });

  it('should get message details', async () => {
    service['gmail'] = {
      users: {
        messages: {
          get: jest.fn().mockResolvedValue({ data: {} }),
        },
      },
    };
    const messageDetails = await service.getMessageDetails('messageId');
    expect(messageDetails).toEqual({ attachments: [] });
  });
});
