import { Response, Request, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import errors from '../models/errors/errors';
import db from '../services/db';
import { makeResponse, makeErrorResponse, makeLog } from '../utils/utils';

const tokenGenSecret = process.env.TOKEN_GEN_SECRET ? process.env.TOKEN_GEN_SECRET : '';

function getDecodedTokenValues(decodedToken: JwtPayload | string) {
  const decoded = {
    user_id: '',
    role_id: '',
  };
  for (const [key, value] of Object.entries(decodedToken)) {
    console.log(`${key}: ${value}`);
    if (key === 'role') decoded.role_id = value.id;
    if (key === 'id') decoded.user_id = value;
  }
  return decoded;
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token: string = req.cookies.token;
  jwt.verify(token ? token : '', tokenGenSecret, function(err, decoded) {
    if (err) {
      makeLog('verify-token', err);
      switch (err.message) {
        case 'jwt must be provided':
          return makeResponse(res, 401, makeErrorResponse(errors.message.unauthenticated, errors.code.unauthenticated));
        case 'jwt expired':
          if (decoded) {
            const { user_id } = getDecodedTokenValues(decoded);
            const deleteLogin = `
              DELETE FROM logins_temp l WHERE l.user_id = $1 AND l.token = $2
            `;
            db.queryPromise(deleteLogin, [user_id, token])
              .then(_deleteLoginResult => {
                return makeResponse(res, 403, makeErrorResponse(errors.message.expiredToken, errors.code.expiredToken));
              })
              .catch((err: Error) => {
                makeLog('delete-token', { name: err.name, message: err.message, stack: err.stack });
                return makeResponse(res, 400, makeErrorResponse(errors.message.badRequest, errors.code.general));
              });
          } else {
            return makeResponse(res, 403, makeErrorResponse(errors.message.expiredToken, errors.code.expiredToken));
          }
        case 'invalid signature':
          return makeResponse(res, 403, makeErrorResponse(errors.message.invalidAuthToken, errors.code.invalidAuthToken));
        default:
          return makeResponse(res, 401, makeErrorResponse(errors.message.unauthenticated, errors.code.unauthenticated));
      }
    } else {
      if (decoded) {
        const { user_id, role_id } = getDecodedTokenValues(decoded);
        const loginQuery = `
          SELECT l.id, l.user_id, l.token
          FROM logins_temp l
          WHERE l.user_id = $1 AND l.token = $2
        `;
        db.queryPromise(loginQuery, [user_id, token])
          .then(loginQueryResult => {
            if (loginQueryResult.rowCount === 1) {
              req.headers['user_id'] = user_id;
              req.headers['role_id'] = role_id;
              req.headers['user_token'] = token;
              return next();
            } else {
              return makeResponse(res, 401, makeErrorResponse(errors.message.unauthenticated, errors.code.unauthenticated));
            }
          })
          .catch((err: Error) => {
            makeLog('check-token', { name: err.name, message: err.message, stack: err.stack });
            return makeResponse(res, 400, makeErrorResponse(errors.message.badRequest, errors.code.general));
          });
      } else {
        return makeResponse(res, 401, makeErrorResponse(errors.message.unauthenticated, errors.code.unauthenticated));
      }
    }
  });
}
