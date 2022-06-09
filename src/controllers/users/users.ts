import type { Request, Response } from 'express';
import db from '../../services/db';
import { makeResponse ,makeErrorResponse, makeLog } from '../../utils/utils';
import errors from '../../models/errors/errors';

// interface Query {
//   id?: string;
// }

// async function getUserById(id: string, res: Response) {
//   try {
//     const data = await db.queryPromise(
//       'SELECT users.id, users.name, users.email, users.avatar from users WHERE users.id = $1',
//       [id]
//     );
//     if (data.rows[0]) {
//       return res.status(200).send({
//         ...data.rows[0],
//       });
//     } else {
//       return res.status(404).send(makeErrorResponse('User is not found', '99999'));
//     }
//   } catch (err) {
//     return res.status(400).send({
//       message: 'General error',
//       code: '99999',
//     });
//   }
// }

function getAllUsers(_req: Request, res: Response) {
  db.queryPromise(
    'SELECT users.id, users.name, users.email from users',
    []
  )
    .then(queryResult => {
      return makeResponse(res, 200, { users: queryResult.rows });
    })
    .catch((err: Error) => {
      makeLog('get-users', err);
      return makeResponse(res, 400, makeErrorResponse('Bad request', errors.code.general));
    })
}

const usersController = { getAllUsers };

export default usersController;
