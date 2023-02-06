import { Request, Response } from 'express';
import { createUserService } from '../services/createUser';

async function createUser(req: Request, res: Response) {
  try {
    const body = req.body;
    let errors = [];
  
    if (!body.first_name) errors.push('first_name (required)');
    if (!body.last_name) errors.push('last_name (required)');
    if (!body.gender) errors.push('gender (required)');
    if (!body.date_of_birth) errors.push('date_of_birth (required)');

    if (errors.length) throw Error(JSON.stringify(errors));

    const result = await createUserService({
      first_name: body.first_name,
      last_name: body.last_name,
      gender: body.gender,
      date_of_birth: body.date_of_birth,
    });

    if (!result) throw Error(JSON.stringify(['Server error, please try again later']));
    
    return res.status(200).send(result);

  } catch(e: any) {
    const err = e.stack.split('Error:');

    const start = err[1].indexOf('[');
    const end = err[1].indexOf(']');

    const errs = JSON.parse(err[1].slice(start, end + 1));
    const message = `${errs.join(', ')}`;

    return res.status(400).send({ message });
  }
}

const userController = { createUser };

export default userController;
