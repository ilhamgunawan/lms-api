import { Request, Response } from 'express';
import knex from '../connection';
import UserAccountService from '../services/UserAccount';
import UserLoginDataService from '../services/UserLoginData';
import PasswordHashService from '../services/PasswordHash';
import ErrorHandlerService from '../services/ErrorHandler';
import { messages, responseStatus, errorName } from '../utils/constant';

export default class UserController {
  static readonly controller = 'UserController';

  static async createUser(req: Request, res: Response) {
    const trxProvider = knex.transactionProvider();
    const trx = await trxProvider();
  
    try {
      const body = req.body;
      const missingFields = [];
      const result: Record<string, any> = {};
      
      if (!body.first_name) missingFields.push('first_name');
      if (!body.last_name) missingFields.push('last_name');
      if (!body.gender) missingFields.push('gender');
      if (!body.date_of_birth) missingFields.push('date_of_birth');
      if (!body.user_name) missingFields.push('user_name');
      
      if (missingFields.length) {
        const err = new Error();
        err.name = errorName.missingFields;
        err.message = JSON.stringify(missingFields);
        throw err;
      };
  
      const userAccountPostResult = await UserAccountService.post(trx, {
        first_name: body.first_name,
        last_name: body.last_name,
        gender: body.gender,
        date_of_birth: body.date_of_birth,
      });
  
      if (userAccountPostResult.err) {
        throw userAccountPostResult.err;
      }
  
      if (userAccountPostResult.data) {
        let passwordPlain = body.password;
  
        if (!body.password) {
          const birthDate = new Date(userAccountPostResult.data.date_of_birth);
          const year = birthDate.getFullYear();
          const month = birthDate.getMonth() + 1;
          const day = birthDate.getDate();
          passwordPlain = `${month}${day}${year}`;
        }
  
        const userLoginDataResult = await UserLoginDataService.post(trx, {
          user_id: userAccountPostResult.data.id,
          user_name: body.user_name,
          psw_hash: PasswordHashService.createHash(passwordPlain),
        });
  
        if (userLoginDataResult.err) throw userLoginDataResult.err;
  
        await trx.commit();
  
        result.data = {
          ...userAccountPostResult.data,
          user_name: userLoginDataResult.data?.user_name,
          psw_hash: userLoginDataResult.data?.psw_hash,
        };
      }
      
      return res.status(responseStatus.ok).send(result);
  
    } catch(e) {
      const errorHandler = new ErrorHandlerService();
      return await errorHandler.controllerHandler({
        req,
        res,
        trx,
        e,
        controller: `${this.controller}.createUser`,
      });
    }
  }

  static async getUserById(req: Request, res: Response) {
    const trxProvider = knex.transactionProvider();
    const trx = await trxProvider();
  
    try {
      const userId = req.params.id;
      const missingFields = [];
  
      if (!userId) {
        missingFields.push('id');
        const err = new Error();
        err.name = errorName.missingFields;
        err.message = JSON.stringify(missingFields);
        throw err;
      }
  
      const result = await UserAccountService.getById(trx, userId);
  
      if (result.err) throw result.err;
      if (!result.data) {
        const err = new Error(messages.notFound);
        err.name = errorName.notFound;
        throw err;
      }
  
      return res.status(responseStatus.ok).send(result);
    } catch(e) {
      const errorHandler = new ErrorHandlerService();
      return await errorHandler.controllerHandler({
        req,
        res,
        trx,
        e,
        controller: `${this.controller}.getUserById`,
      });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    const trxProvider = knex.transactionProvider();
    const trx = await trxProvider();
  
    try {
      const query = req.query;
      const offset = query.offset ? parseInt(query.offset as string) : 0;
      const limit = query.limit ? parseInt(query.limit as string) : 15;
      const result: Record<string, any> = {};

      const getAllUsersResult = await UserAccountService.getAll(trx, {
        offset,
        limit,
      });

      if (getAllUsersResult.err) throw getAllUsersResult.err;

      const countAllUsers = await UserAccountService.countAll(trx);
      
      if (countAllUsers.err) throw countAllUsers.err;

      result.data = {
        users: getAllUsersResult.data,
        total_current: getAllUsersResult.data?.length,
        total_all: parseInt(countAllUsers.data.count),
        offset,
        limit,
      };
  
      return res.status(responseStatus.ok).send(result);
    } catch(e) {
      const errorHandler = new ErrorHandlerService();
      return await errorHandler.controllerHandler({
        req,
        res,
        trx,
        e,
        controller: `${this.controller}.getAllUsers`,
      });
    }
  }
}
