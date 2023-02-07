import { Request, Response } from 'express';
import knex from '../connection';
import AuthService from '../services/Auth';
import UserLoginDataService from "../services/UserLoginData";
import UserAccountService from '../services/UserAccount';
import PasswordHashService from '../services/PasswordHash';
import ErrorReporterService from '../services/ErrorReporter';
import { messages, responseStatus, errorName } from '../utils/constant';

async function login(req: Request, res: Response) {
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
    let message = messages.general;
    let status = responseStatus.internalServerError;

    if (e instanceof Error) {
      message = e.message;

      if (e.name === errorName.missingFields) {
        message = messages.missingFields(JSON.parse(e.message).join(', '));
        status = responseStatus.badRequest;
      }

      if (e.name === errorName.invalidLogin) {
        status = responseStatus.badRequest;
      }

      if (e.name === errorName.invalidJwtSecret) {
        message = messages.general;
      }
    }

    ErrorReporterService.controllerError({
      controller: 'auth.login',
      message,
    });

    await trx.rollback();

    return res.status(status).send({ message });
  }
}

const authController = {
  login,
};

export default authController;
