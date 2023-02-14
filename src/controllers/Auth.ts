import { Request, Response } from 'express';
import knex from '../connection';
import AuthService from '../services/Auth';
import UserLoginDataService from "../services/UserLoginData";
import UserAccountService from '../services/UserAccount';
import PasswordHashService from '../services/PasswordHash';
import ErrorHandlerService from '../services/ErrorHandler';
import { messages, responseStatus, errorName } from '../utils/constant';

export default class AuthController {
  static readonly controller = 'AuthController';

  static async login(req: Request, res: Response) {
    const trxProvider = knex.transactionProvider();
    const trx = await trxProvider();
  
    try {
      const body = req.body;
      const missingFields = [];
      const result: Record<string, any> = {};
  
      if (!body.user_name) missingFields.push('user_name');
      if (!body.password) missingFields.push('password');
  
      if (missingFields.length) {
        const err = new Error();
        err.name = errorName.missingFields;
        err.message = JSON.stringify(missingFields);
        throw err;
      }
  
      const getUserLoginDataResult = await UserLoginDataService.getByUsername(trx, body.user_name);
      if (getUserLoginDataResult.err) throw getUserLoginDataResult.err;
      if (!getUserLoginDataResult.data) {
        const err = new Error(messages.invalidLogin);
        err.name = errorName.invalidLogin;
        throw err;
      }
  
      if (getUserLoginDataResult.data) {
        const isPasswordMatch = await PasswordHashService.compare(body.password, getUserLoginDataResult.data.psw_hash);
        if (!isPasswordMatch) {
          const err = new Error(messages.invalidLogin);
          err.name = errorName.invalidLogin;
          throw err;
        }
  
        const getUserByIdResult = await UserAccountService.getById(trx, getUserLoginDataResult.data.user_id);
        if (getUserByIdResult.err) throw getUserByIdResult.err;
  
        if (getUserByIdResult.data) {
          const createTokenResult = await AuthService.createToken({
            user_id: getUserByIdResult.data.id,
            user_name: getUserLoginDataResult.data.user_name,
            first_name: getUserByIdResult.data.first_name,
            last_name: getUserByIdResult.data.last_name,
            gender: getUserByIdResult.data.gender,
          });
  
          if (createTokenResult.err) throw createTokenResult.err;
          
          result.data = {
            user_name: getUserLoginDataResult.data.user_name,
            user_id: getUserLoginDataResult.data.user_id,
            first_name: getUserByIdResult.data?.first_name,
            last_name: getUserByIdResult.data?.last_name,
            gender: getUserByIdResult.data?.gender,
            date_of_birth: getUserByIdResult.data?.date_of_birth,
            token: createTokenResult.data,
          };
        }
      }
  
      return res.status(responseStatus.ok).send(result);
    } catch(e) {
      const errorHandler = new ErrorHandlerService();
      return await errorHandler.controllerHandler({
        req,
        res,
        trx,
        e,
        controller: `${this.controller}.login`,
      });
    }
  }

  static async validateToken(req: Request, res: Response) {
    try {
      const body = req.body;
      const missingFields = [];
      const result: Record<string, any> = {};

      if (!body.token) missingFields.push('token');

      if (missingFields.length) {
        const err = new Error();
        err.name = errorName.missingFields;
        err.message = JSON.stringify(missingFields);
        throw err;
      }

      const verifyTokenResult = await AuthService.verifyToken(body.token);

      if (verifyTokenResult.err) throw verifyTokenResult.err;

      if (!verifyTokenResult.data) {
        const err = new Error(messages.invalidToken);
        err.name = errorName.invalidToken;
        throw err;
      }

      result.data = {
        token: verifyTokenResult.data,
      };
      
      return res.status(responseStatus.ok).send(result);
    } catch(e) {
      const errorHandler = new ErrorHandlerService();
      return await errorHandler.controllerHandler({
        req,
        res,
        e,
        controller: `${this.controller}.validateToken`,
      });
    } 
  }
}
