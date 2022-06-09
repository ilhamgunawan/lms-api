import { Request, Response } from 'express';
import db from '../../services/db';
import errors from '../../models/errors/errors';
import { makeLog, makeResponse, makeErrorResponse } from '../../utils/utils';

function post(req: Request, res: Response) {
  const userID = req.headers['user_id'] ? req.headers['user_id'].toString() : '';
  const userToken = req.headers['user_token'] ? req.headers['user_token'].toString() : '';
  db.queryPromise(
    `DELETE FROM logins_temp lt WHERE lt.user_id = $1 AND lt.token = $2`
    , [userID, userToken])
    .then(_logoutResult => {
      return res.status(200)
        .cookie('token', '', { httpOnly: true, path: '/' })
        .send({
          message: 'Logout success',
        });
    })
    .catch((err: Error) => {
      makeLog('logout-error', { name: err.name, message: err.message, stack: err.stack });
      return makeResponse(res, 400, makeErrorResponse(errors.message.badRequest, errors.code.general));
    });
}

const logoutController = { post };
export default logoutController;
