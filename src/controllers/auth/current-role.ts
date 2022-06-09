import { Request, Response } from 'express';
import { makeResponse } from '../../utils/utils';

function get(req: Request, res: Response) {
  const role = req.headers['role'] ? req.headers['role'].toString() : '';
  return makeResponse(res, 200, { role });
}

const currentRoleController = { get };
export default currentRoleController;
