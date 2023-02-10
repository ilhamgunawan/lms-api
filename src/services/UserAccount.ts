import knex from '../connection';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { messages, errorName } from '../utils/constant';
import ErrorReporterService from './ErrorReporter';

interface UserAccount {
  id: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
}

interface CreateUserAccount {
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
}

interface GetAllUserAccount {
  offset: number
  limit: number
}

interface Result<T> {
  data?: T
  err?: Error
}

export default class UserAccountService {
  static readonly service = 'UserAccountService';
  static readonly table = 'user_account';
  static readonly columns = {
    id: 'id',
    first_name: 'first_name',
    last_name: 'last_name',
    gender: 'gender',
    date_of_birth: 'date_of_birth',
  };

  static async getById(trx: Knex.Transaction, userId: string): Promise<Result<UserAccount>> {
    const { id, first_name, last_name, gender, date_of_birth } = this.columns;
    return trx.select(id, first_name, last_name, gender, date_of_birth)
      .from(this.table)
      .where({ id: userId })
      .returning<UserAccount[]>([
        id,
        first_name,
        last_name,
        gender,
        date_of_birth,
      ])
      .then((rows) => ({ data: rows[0] }))
      .catch(e => {
        trx.rollback();
        return this.errorHandler<UserAccount>(e, 'getById');
      });
  }

  static async getAll(trx: Knex.Transaction, params: GetAllUserAccount): Promise<Result<UserAccount[]>> {
    const { id, first_name, last_name, gender, date_of_birth } = this.columns;
    return trx.select(id, first_name, last_name, gender, date_of_birth)
      .from(this.table)
      .offset(params.offset)
      .limit(params.limit)
      .returning<UserAccount[]>([
        id,
        first_name,
        last_name,
        gender,
        date_of_birth,
      ])
      .then((rows) => ({ data: rows }))
      .catch(e => {
        trx.rollback();
        return this.errorHandler<UserAccount[]>(e, 'getAll');
      });
  }

  static async countAll(trx: Knex.Transaction): Promise<Result<any>> {
    return trx.count({ count: '*' })
      .from(this.table)
      .then((rows) => {
        return { data: rows[0] }
      })
      .catch(e => {
        trx.rollback();
        return this.errorHandler(e, 'countAll');
      });
  }

  static async post(trx: Knex.Transaction, user: CreateUserAccount): Promise<Result<UserAccount>> {
    return trx.insert({
        id: uuidv4(),
        ...user,
      })
      .into(this.table)
      .returning<UserAccount[]>([
        this.columns.id, 
        this.columns.first_name, 
        this.columns.last_name, 
        this.columns.gender, 
        this.columns.date_of_birth
      ])
      .then((rows) => {
        return { data: rows[0] };
      })
      .catch(e => {
        trx.rollback();
        return this.errorHandler<UserAccount>(e, 'post');
      });
  }

  private static errorHandler<T>(e: unknown, method: string): Result<T> {
    let err = new Error();
    let message = messages.general;

    if (e instanceof Error) {
      err = e;
      message = err.message;

      if (method === 'getById' && message.includes('invalid input syntax for type uuid')) {
        err.name = errorName.notFound;
        err.message = messages.notFound;
      }

      if (method === 'post' && message.includes('invalid input syntax for type timestamp')) {
        err.name = errorName.badTimestampFormat;
        err.message = messages.badTimestampFormat;
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
