import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { Mail } from './entities/mail.entities';

describe('MailController', () => {
  let mailController: MailController;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: {
            getMessageDetails: jest.fn(),
            getMessages: jest.fn(),
            getInvoices: jest.fn(),
            getAttachments: jest.fn(),
            getAttachmentDetails: jest.fn(),
          },
        },
      ],
    }).compile();

    mailController = module.get<MailController>(MailController);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(mailController).toBeDefined();
  });

  describe('getMessageDetails', () => {
    it('should return message details', async () => {
      const result: Mail = { id: '1', subject: 'Test', snippet: 'Test body' };
      jest.spyOn(mailService, 'getMessageDetails').mockResolvedValue(result);

      expect(await mailController.getMessageDetails('1')).toBe(result);
    });
  });

  describe('getMessages', () => {
    it('should return an array of messages', async () => {
      const result: Mail[] = [
        { id: '1', subject: 'Test', snippet: 'Test body' },
      ];
      jest.spyOn(mailService, 'getMessages').mockResolvedValue(result);

      expect(await mailController.getMessages()).toBe(result);
    });
  });

  describe('getInvoices', () => {
    it('should return an array of invoices', async () => {
      const result: Mail[] = [
        { id: '1', subject: 'Invoice', snippet: 'Invoice body' },
      ];
      jest.spyOn(mailService, 'getInvoices').mockResolvedValue(result);

      expect(await mailController.getInvoices()).toBe(result);
    });
  });

  describe('getAttachments', () => {
    it('should return attachments', async () => {
      const result = [{ id: '1', filename: 'file.pdf' }];
      jest.spyOn(mailService, 'getAttachments').mockResolvedValue(result);

      expect(await mailController.getAttachments('1')).toBe(result);
    });
  });

  describe('getAttachmentDetails', () => {
    it('should return attachment details', async () => {
      const result = { id: '1', filename: 'file.pdf', data: 'base64data' };
      jest.spyOn(mailService, 'getAttachmentDetails').mockResolvedValue(result);

      expect(await mailController.getAttachmentDetails('1', '1')).toBe(result);
    });
  });

  describe('downloadAttachment', () => {
    it('should download attachment', async () => {
      const result = { id: '1', filename: 'file.pdf', data: 'base64data' };
      jest.spyOn(mailService, 'getAttachmentDetails').mockResolvedValue(result);

      const res = {
        set: jest.fn(),
        send: jest.fn(),
      };

      await mailController.downloadAttachment('1', '1', res as any);

      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="facture.pdf"',
      });
      expect(res.send).toHaveBeenCalledWith(Buffer.from(result.data, 'base64'));
    });
  });
});
