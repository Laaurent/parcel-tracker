export class MailLegacy {
  id: string;
  threadId?: string;
  labelIds?: string[];
  snippet: string;
  payload?: Payload;
  sizeEstimate?: number;
  historyId?: string;
  internalDate?: string;
}

export class Mail extends MailLegacy {
  subject?: string;
  attachments?: any[];
}

export class Payload {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: Header[];
  body?: Body;
  parts?: Part[];
}

export class Header {
  name: string;
  value: string;
}

export class Body {
  size: number;
}

export class Part {
  partId: string;
  mimeType: string;
  filename: string;
  headers?: Header2[];
  body: Body2;
}

export class Header2 {
  name: string;
  value: string;
}

export class Body2 {
  attachmentId?: string;
  attachmentUrl?: string;
  attachementDownloadUrl?: string;
  size: number;
  data: string;
}
