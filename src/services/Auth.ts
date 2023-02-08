import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { messages, errorName } from '../utils/constant';
import ErrorReporterService from './ErrorReporter';

interface CreateToken {
  user_name: string
  user_id: string
  first_name: string
  last_name: string
  gender: string
}

interface Result<T> {
  data?: T
  err?: Error
}

const jwtSecret = process.env.JWT_SECRET;

export default class AuthService {
  static readonly service = 'AuthService';

  static async createToken(params: CreateToken): Promise<Result<string>> {
    return new Promise((resolve) => {
      if (!jwtSecret) {
        resolve(this.errorHandler(new Error(messages.invalidJwtSecret), 'createToken'));
      } else {
        jwt.sign({ ...params }, jwtSecret, { expiresIn: '1h' }, (err, encoded) => {
          if (err) resolve(this.errorHandler(err, 'createToken'));
    
          resolve({ data: encoded });
        });
      }
    });
  }

  static async verifyToken(token: string): Promise<Result<string | jwt.JwtPayload>> {
    return new Promise((resolve) => {
      if (!jwtSecret) {
        resolve(this.errorHandler(new Error(messages.invalidJwtSecret), 'verifyToken'));
      } else {
        jwt.verify(token, jwtSecret, (err, decoded) => {
          if (err) resolve(this.errorHandler(err, 'verifyToken'));

          resolve({ data: decoded });
        });
      }
    });
  }

  private static errorHandler<T>(e: unknown, method: string): Result<T> {
    let err = new Error();
    let message = messages.general;

    if (e instanceof Error) {
      err = e;
      message = err.message;

      if (message.includes(messages.invalidJwtSecret)) {
        err.name = errorName.invalidJwtSecret;
      }

      if (e.message.includes('jwt malformed')) {
        err.name = errorName.invalidToken;
      }

      if (e.message.includes('jwt expired')) {
        err.name = errorName.tokenExpired;
      }
    }

    ErrorReporterService.serviceError({
      service: `${this.service}.${method}`,
      table: 'N/A',
      message,
    });

    return { err };
  }
}
