import { QueryResult } from 'pg';
import db from './db';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

interface Role {
  role_id: string;
  name: string;
}

interface LoginTemp {
  id: string;
  user_id: string;
  token: string;
}

function getUserByEmail(email: string): Promise<QueryResult<User>> {
  return db.queryPromise(
    `
      SELECT u.id, u.email, u.name, u.password
      FROM users u
      WHERE u.email = $1
    `,
    [email.toLowerCase()],
  );
}

function insertLoginTemp(userId: string, token: string) {
  return db.queryPromise(
    `
      INSERT INTO logins_temp
      (id, user_id, "token")
      VALUES(gen_random_uuid(), $1, $2);        
    `,
    [userId, token],
  );
}

function getDefaultRoleByUserID(userID: string): Promise<QueryResult<Role>>  {
  return db.queryPromise(
    `
      SELECT us.value AS role_id, r.name AS name
      FROM users_settings us 
      LEFT JOIN roles r ON r.id::text = us.value 
      WHERE us.name = 'default_role'
      AND us.user_id = $1
    `,
    [userID],
  );
}

function deleteLoginTemp(userID: string, token: string) {
  return db.queryPromise(
    `DELETE FROM logins_temp lt WHERE lt.user_id = $1 AND lt.token = $2`,
    [userID, token],
  );
}

function getLoginTempByUserIdAndToken(userID: string, token: string): Promise<QueryResult<LoginTemp>> {
  return db.queryPromise(
    `
      SELECT l.id, l.user_id, l.token
      FROM logins_temp l
      WHERE l.user_id = $1 AND l.token = $2
    `,
    [userID, token],
  );
}

function getRole(roleID: string) {
  return db.queryPromise(
    `
      SELECT *
      FROM roles r
      WHERE r.id::text = $1
    `,
    [roleID],
  );
}

const Auth = {
  getUserByEmail,
  insertLoginTemp,
  getDefaultRoleByUserID,
  deleteLoginTemp,
  getLoginTempByUserIdAndToken,
  getRole,
};

export default Auth;
