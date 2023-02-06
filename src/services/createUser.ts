import knex from '../connection';
import { v4 as uuidv4 } from 'uuid';

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

export async function createUserService(user: CreateUser): Promise<User | null> {
  return knex.transaction<User[]>((trx) => {
    knex('user_account')
      .transacting(trx)
      .insert({
        id: uuidv4(),
        ...user,
      })
      .returning(['id', 'first_name', 'last_name', 'gender', 'date_of_birth'])
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .then((inserts) => inserts[0])
  .catch(e => {

    console.log(`
      Error:
        - service: createUser
        - table: user_account
        - ${e.stack}\n
    `);

    return null;
  });
}
