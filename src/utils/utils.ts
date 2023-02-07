import type { Response } from 'express';

export function makeLog(title: string, body: string | object, withTime: boolean = false) {
  if (withTime) {
    const date = new Date();
    const time = date.toLocaleTimeString();
    const localDate = date.toLocaleDateString();
    console.log(`⚡️[${title}]: `, 
      {
        executedAt: `${time} - ${localDate}`,
        message: body,
      }
    );
  } else {
    console.log(`⚡️[${title}]: `, body);
  }
}

interface ErrorResponse {
  message: string;
  code: string;
};

export function makeErrorResponse(message: string, code: string) {
  const response: ErrorResponse = {
    message,
    code,
  };
  return response;
};

export function makeResponse(res: Response, status: number, body: any) {
  return res.status(status).send(body);
}
