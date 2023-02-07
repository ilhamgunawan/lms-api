import knex from '../connection';
import { v4 as uuidv4 } from 'uuid';
import { messages } from '../utils/constant';
import { serviceErrorReporter } from '../utils/utils';

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

  static async post(user: CreateUserAccount): Promise<Result<UserAccount>> {
    return knex.transaction<UserAccount[]>((trx) => {
      knex(this.table)
        .transacting(trx)
        .insert({
          id: uuidv4(),
          ...user,
        })
        .returning([
          this.columns.id, 
          this.columns.first_name, 
          this.columns.last_name, 
          this.columns.gender, 
          this.columns.date_of_birth
        ])
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .then((inserts) => ({ data: inserts[0] }))
    .catch(e => this.errorHandler<UserAccount>(e, 'post'));
  }

  private static errorHandler<T>(e: unknown, method: string): Result<T> {
    let err = new Error();
    let message = messages.general;

    if (e instanceof Error) {
      err = e
      message = err.message;
    }

    serviceErrorReporter({
      service: `${this.service}.${method}`,
      table: this.table,
      message,
    });

    return { err };
  }
}