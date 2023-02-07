import { Request, Response } from 'express';
import UserAccountService from '../services/UserAccount';
import { messages, responseStatus, errorName } from '../utils/constant';

async function getUserById(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const missingFields = [];

    if (!userId) {
      missingFields.push('id');
      const err = new Error();
      err.name = errorName.missingFields;
      err.message = JSON.stringify(missingFields);
      throw err;
    }

    const result = await UserAccountService.getById(userId);

    if (result.err) throw result.err;
    if (!result.data) {
      const err = new Error(messages.notFound);
      err.name = errorName.notFound;
      throw err;
    }

    return res.status(responseStatus.ok).send(result);
  } catch(e) {
    let message = messages.general;
    let status = responseStatus.internalServerError;

    if (e instanceof Error) {
      
      if (e.name === errorName.notFound) {
        message = e.message;
        status = responseStatus.notFound;
      }
    }

    return res.status(status).send({ message });
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const body = req.body;
    const missingFields = [];
    
    if (!body.first_name) missingFields.push('first_name');
    if (!body.last_name) missingFields.push('last_name');
    if (!body.gender) missingFields.push('gender');
    if (!body.date_of_birth) missingFields.push('date_of_birth');
    
    if (missingFields.length) {
      const err = new Error();
      err.name = errorName.missingFields;
      err.message = JSON.stringify(missingFields);
      throw err;
    };

    const result = await UserAccountService.post({
      first_name: body.first_name,
      last_name: body.last_name,
      gender: body.gender,
      date_of_birth: body.date_of_birth,
    });

    if (result.err) {
      throw result.err;
    };
    
    return res.status(responseStatus.ok).send(result);

  } catch(e) {
    let message = messages.general;
    let status = responseStatus.internalServerError;

    if (e instanceof Error) {

      if (e.name === errorName.missingFields) {
        message = messages.missingFields(JSON.parse(e.message).join(', '));
        status = responseStatus.badRequest;
      }

    }

    return res.status(status).send({ message });
  }
}

const userController = { 
  createUser, 
  getUserById, 
};

export default userController;
