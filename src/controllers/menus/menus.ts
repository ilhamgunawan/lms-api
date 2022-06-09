import type { Request, Response } from 'express';
import { QueryResult } from 'pg';
import db from '../../database/db';
import { makeResponse ,makeErrorResponse, makeLog } from '../../utils/utils';
import { Menu } from '../../models/menus/menus';
import errors from '../../models/errors/errors';

function getMenus(req: Request, res: Response) {
  const roleID = req.headers['role_id'] ? req.headers['role_id'].toString() : '';
  db.queryPromise(
    `
      select r.id, r."name", r.value as path
      from resources r 
      left join roles_to_resources rtr on rtr.resource_id = r.id 
      left join menus_order mo on mo.resource_id = r.id 
      where rtr.role_id::text = $1
    `,
    [roleID]
  )
    .then((queryResult: QueryResult<Menu>) => {
      return makeResponse(res, 200, { menus: queryResult.rows, message: 'Success' });
    })
    .catch((err: Error) => {
      makeLog('get-menus', err);
      return makeResponse(res, 400, makeErrorResponse('Bad request', errors.code.general));
    })
}

const menusController = { getMenus };

export default menusController;
