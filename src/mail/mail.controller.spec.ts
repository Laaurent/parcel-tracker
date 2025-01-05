import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { AuthGuard } from '../common/guards/auth.gard';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { Mail } from './entities/mail.entities';

describe('MailController', () => {
  let controller: MailController;
  let service: MailService;

  const mockMailService = {
    getMessageDetails: jest.fn(),
    getMessages: jest.fn(),
    getInvoices: jest.fn(),
    getAttachments: jest.fn(),
    getAttachmentDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideInterceptor(ResponseInterceptor)
      .useValue({ intercept: jest.fn((context, next) => next.handle()) })
      .compile();

    controller = module.get<MailController>(MailController);
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get message details', async () => {
    const result = new Mail();
    jest.spyOn(service, 'getMessageDetails').mockResolvedValue(result);

    expect(await controller.getMessageDetails('user1', 'message1')).toBe(
      result,
    );
    expect(service.getMessageDetails).toHaveBeenCalledWith('user1', 'message1');
  });

  it('should get messages', async () => {
    const result = [new Mail()];
    jest.spyOn(service, 'getMessages').mockResolvedValue(result);

    expect(await controller.getMessages('user1')).toBe(result);
    expect(service.getMessages).toHaveBeenCalledWith('user1');
  });

  it('should get invoices', async () => {
    const result = [new Mail()];
    jest.spyOn(service, 'getInvoices').mockResolvedValue(result);

    expect(await controller.getInvoices('user1')).toBe(result);
    expect(service.getInvoices).toHaveBeenCalledWith('user1');
  });

  it('should get attachments', async () => {
    const result = {};
    jest.spyOn(service, 'getAttachments').mockResolvedValue(result);

    expect(await controller.getAttachments('user1', 'message1')).toBe(result);
    expect(service.getAttachments).toHaveBeenCalledWith('user1', 'message1');
  });

  it('should get attachment details', async () => {
    const result = {};
    jest.spyOn(service, 'getAttachmentDetails').mockResolvedValue(result);

    expect(
      await controller.getAttachmentDetails('user1', 'attachment1', 'message1'),
    ).toBe(result);
    expect(service.getAttachmentDetails).toHaveBeenCalledWith(
      'user1',
      'attachment1',
      'message1',
    );
  });

  it('should download attachment', async () => {
    const result = { data: 'base64data' };
    jest.spyOn(service, 'getAttachmentDetails').mockResolvedValue(result);

    const res = {
      set: jest.fn(),
      send: jest.fn(),
    };

    await controller.downloadAttachment(
      'user1',
      'attachment1',
      'message1',
      res as any,
    );

    expect(service.getAttachmentDetails).toHaveBeenCalledWith(
      'user1',
      'attachment1',
      'message1',
    );
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="facture.pdf"',
    });
    expect(res.send).toHaveBeenCalledWith(Buffer.from(result.data, 'base64'));
  });
});
