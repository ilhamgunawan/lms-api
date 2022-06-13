import { Response, Request, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Auth from '../database/Auth';
import { makeLog } from '../utils/utils';

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

function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token: string = req.cookies.token;
  jwt.verify(token ? token : '', tokenGenSecret, function(err, decoded) {
    if (err) {
      makeLog('verify-token', err);
      switch (err.message) {
        case 'jwt must be provided':
          return res.status(401).send({
            status: 'Bad request',
            data: null,
            message: 'No token provided',
          });
        case 'jwt expired':
          if (decoded) {
            const { user_id } = getDecodedTokenValues(decoded);
            Auth.deleteLoginTemp(user_id, token)
              .then(result => {
                return res.status(401).send({
                  status: 'Bad request',
                  data: null,
                  message: 'Expired token', 
                });
              })
              .catch(e => {
                const url = new URL(req.url, `http://${req.headers.host}`);
                console.log({
                  status: 'error',
                  url,
                  error: e,
                });
                return res.status(400).send({
                  status: 'Bad request',
                  data: null,
                  message: "Something wen't wrong, please try again later",
                });
              });
          } else {
            return res.status(401).send({
              status: 'Bad request',
              data: null,
              message: 'Expired token', 
            });
          }
        case 'invalid signature':
          return res.status(401).send({
            status: 'Bad request',
            data: null,
            message: 'Invalid token', 
          });
        default:
          return res.status(401).send({
            status: 'Bad request',
            data: null,
            message: 'Invalid token', 
          });
      }
    } else {
      if (decoded) {
        const { user_id, role_id } = getDecodedTokenValues(decoded);
        Auth.getLoginTempByUserIdAndToken(user_id, token)
          .then(result => {
            if (result.rowCount === 1) {
              req.headers['user_id'] = user_id;
              req.headers['role_id'] = role_id;
              req.headers['user_token'] = token;
              return next();
            }
            return res.status(401).send({
              status: 'Bad request',
              data: null,
              message: 'Invalid token', 
            });
          })
          .catch(e => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            console.log({
              status: 'error',
              url,
              error: e,
            });
            return res.status(400).send({
              status: 'Bad request',
              data: null,
              message: "Something wen't wrong, please try again later",
            });
          });
      } else {
        return res.status(401).send({
          status: 'Bad request',
          data: null,
          message: 'Invalid token', 
        });
      }
    }
  });
}

const middlewares = { verifyToken };

export default middlewares;
