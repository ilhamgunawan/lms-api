import { Request, Response } from 'express';
import { makeErrorResponse, makeLog, makeResponse } from '../../utils/utils';
import db from '../../database/db';
import { User } from '../../models/user/user';
import errors from '../../models/errors/errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const tokenGenSecret = process.env.TOKEN_GEN_SECRET ? process.env.TOKEN_GEN_SECRET : '';

interface Body {
  email: string;
  password: string;
}

type UserQuery = User | undefined;

interface RoleQuery {
  role_id: string;
  name: string;
}

function createLoginFailureResponse(res: Response) {
  return makeResponse(res, 401, makeErrorResponse(errors.message.loginFailure, errors.code.loginFailure));
}

function createUserObject(user: User, roles: Array<RoleQuery>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: {
      id: roles[0].role_id,
      name: roles[0].name,
    },
  };
}

function getUserByEmail(email: string) {
  return db.queryPromise(
    `
      SELECT u.id, u.email, u.name, u.password
      FROM users u
      WHERE u.email = $1
    `,
    [email.toLowerCase()],
  );
}

function getDefaultRoleByUserID(userId: string) {
  return db.queryPromise(
    `
      SELECT us.value AS role_id, r.name AS name
      FROM users_settings us 
      LEFT JOIN roles r ON r.id::text = us.value 
      WHERE us.name = 'default_role'
      AND us.user_id = $1
    `,
    [userId],
  )
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

function login(req: Request, res: Response) {
  const body: Body = req.body;
  getUserByEmail(body.email)
    .then(queryResult => {
      const user: UserQuery = queryResult.rows[0];
      if (user) {
        const passHash = user?.password ? user.password : '';
        const isPassValid = bcrypt.compareSync(body.password, passHash);
        getDefaultRoleByUserID(user.id)
          .then(queryResult => {
            const roles: Array<RoleQuery> = queryResult.rows;
            const userObject = createUserObject(user, roles);
            const token = isPassValid ? jwt.sign(userObject, tokenGenSecret, { expiresIn: '7d' }) : '';
            insertLoginTemp(user.id, token)
              .then(_queryResult => {
                return isPassValid
                ? res.status(200)
                  .cookie('token', token, { httpOnly: true, path: '/' })
                  .send({
                    message: 'Login success',
                    status: 'Success',
                    user: userObject,
                  })
                : createLoginFailureResponse(res);
              })
              .catch((err: Error) => {
                makeLog('login-error', { name: err.name, message: err.message, stack: err.stack });
                return makeResponse(res, 400, makeErrorResponse(errors.message.badRequest, errors.code.general));
              });
          })
          .catch((err: Error) => {
            makeLog('login-error', { name: err.name, message: err.message, stack: err.stack});
            return makeResponse(res, 400, makeErrorResponse(errors.message.badRequest, errors.code.general));
          });
      } else {
        return createLoginFailureResponse(res);
      }
    })
    .catch((err: Error) => {
      makeLog('login-error', { name: err.name, message: err.message, stack: err.stack});
      return makeResponse(res, 400, makeErrorResponse(errors.message.badRequest, errors.code.general));
    });
}

const loginController = { login };
export default loginController;
