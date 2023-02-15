import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { messages, errorName } from '../utils/constant';
import ErrorReporterService from './ErrorReporter';

interface UserLoginData {
  id: string
  user_id: string
  user_name: string
  psw_hash: string
}

interface CreateUserLoginData {
  user_id: string
  user_name: string
  psw_hash: string
}

interface Result<T> {
  data?: T
  err?: Error
}

export default class UserLoginDataService {
  static readonly service = 'UserLoginDataService';
  static readonly table = 'user_login_data';
  static readonly columns = {
    id: 'id',
    user_id: 'user_id',
    user_name: 'user_name',
    psw_hash: 'psw_hash',
  };

  static async post(trx: Knex.Transaction, params: CreateUserLoginData): Promise<Result<UserLoginData>> {
    return trx.insert({
        id: uuidv4(),
        ...params,
      })
      .into(this.table)
      .returning<UserLoginData[]>([
        this.columns.id, 
        this.columns.user_id, 
        this.columns.user_name, 
        this.columns.psw_hash,
      ])
      .then((rows) => {
        return { data: rows[0] };
      })
      .catch(e => {
        trx.rollback();
        return this.errorHandler<UserLoginData>(e, 'post');
      });
  }

  static async delete(trx: Knex.Transaction, user_id: string): Promise<Result<UserLoginData>> {
    return trx.delete()
      .into(this.table)
      .where({ user_id })
      .returning<UserLoginData[]>([
        this.columns.id, 
        this.columns.user_id, 
        this.columns.user_name,
      ])
      .then((rows) => {
        return { data: rows[0] };
      })
      .catch(e => {
        trx.rollback();
        return this.errorHandler<UserLoginData>(e, 'delete');
      });
  }

  static async getByUsername(trx: Knex.Transaction, user_name: string): Promise<Result<UserLoginData>> {
    return trx.select(this.columns.user_id, this.columns.user_name, this.columns.psw_hash)
      .from(this.table)
      .where({ user_name })
      .returning<UserLoginData[]>([
        this.columns.id,
        this.columns.user_id,
        this.columns.user_name,
        this.columns.psw_hash,
      ])
      .then((rows) => ({ data: rows[0] }))
      .catch(e => {
        trx.rollback();
        return this.errorHandler<UserLoginData>(e, 'getByUsername');
      });
  }

  private static errorHandler<T>(e: unknown, method: string): Result<T> {
    let err = new Error();
    let message = messages.general;

    if (e instanceof Error) {
      err = e;
      message = err.message;

      if (method === 'post' && message.includes('duplicate key value violates unique constraint')) {
        err.name = errorName.duplicateUsername;
      }
    }

    ErrorReporterService.serviceError({
      service: `${this.service}.${method}`,
      table: this.table,
      message,
    });

    return { err };
  }
}