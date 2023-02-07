import knex from '../connection';
import { v4 as uuidv4 } from 'uuid';
import { messages } from '../utils/constant';
import { serviceErrorReporter } from '../utils/utils';

export interface CreateUser {
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
}

export interface User {
  id: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
}

interface CreateUserResult {
  data?: User
  err?: Error
}

export async function createUserService(user: CreateUser): Promise<CreateUserResult> {
  return knex.transaction<User[]>((trx) => {
    knex('user_accountt')
      .transacting(trx)
      .insert({
        id: uuidv4(),
        ...user,
      })
      .returning(['id', 'first_name', 'last_name', 'gender', 'date_of_birth'])
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .then((inserts) => ({ data: inserts[0] }))
  .catch(e => {
    let err = new Error();
    let message = messages.general;

    if (e instanceof Error) {
      err = e
      message = err.message;
    }

    serviceErrorReporter({
      service: 'createUser',
      table: 'user_account',
      message,
    });

    return { err };
  });
}
