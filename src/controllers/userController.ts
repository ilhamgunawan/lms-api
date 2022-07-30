import { Request, Response } from 'express';
import userService from "../services/userService";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUser();
    return res.status(200).send({
      status: 'Ok',
      data: { users },
      message: 'Success',
    });
  } catch(e) {
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
  }
};

const getUserByID = async (req: Request, res: Response) => {
  try {
    const id: string = req.params['id'];
    const user = await userService.getUserByID(id);
    return res.status(200).send({
      status: 'Ok',
      data: { user: user },
      message: 'Success',
    });
  } catch(e) {
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
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const name: string = req.body['name'];
    const email: string = req.body['email'];
    const role: string = req.body['role'];
    if (name && email && role) {
      const result = await userService.createUser(name, email, role);
      if (result === 1) {
        return res.status(200).send({
          status: 'Ok',
          data: null,
          message: 'Success',
        });
      }
      return res.status(400).send({
        status: 'Bad request',
        data: null,
        message: "You must provide valid name and email",
      });
    }
    return res.status(400).send({
      status: 'Bad request',
      data: null,
      message: "You must provide valid name and email",
    });
  } catch(e) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const err = e as any;
    console.log({
      status: 'error',
      url,
      error: err.stack,
    });
    return res.status(400).send({
      status: 'Bad request',
      data: null,
      message: err.detail,
    });
  }
}

const deleteUser = async (req: Request, res: Response) => {
  try {
    const id: string = req.params['id'];
    if (id) {
      const result = await userService.deleteUser(id);
      if (result === 1) {
        return res.status(200).send({
          status: 'Ok',
          data: null,
          message: 'Success',
        });
      }
      return res.status(400).send({
        status: 'Bad request',
        data: null,
        message:  "You must provide a valid user ID",
      });
    }
    return res.status(400).send({
      status: 'Bad request',
      data: null,
      message: "You must provide a valid user ID",
    });
  } catch(e) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const err = e as any;
    console.log({
      status: 'error',
      url,
      error: err.stack,
    });
    return res.status(400).send({
      status: 'Bad request',
      data: null,
      message: "You must provide a valid user ID",
    });
  }
}

const updateUser = async (req: Request, res: Response) => {
  try {
    const id: string = req.params['id'];
    const name: string | null = req.body['name'] ? req.body['name'] : null;
    const email: string | null = req.body['email'] ? req.body['email'] : null;
    const result = await userService.updateUser(id, {name, email});
    if (result) {
      return res.status(200).send({
        status: 'Ok',
        data: null,
        message: 'Success',
      });
    }
    return res.status(400).send({
      status: 'Bad request',
      data: null,
      message: "You must provide a valid user's data",
    });
  } catch(e) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const err = e as any;
    console.log({
      status: 'error',
      url,
      error: err.stack,
    });
    return res.status(400).send({
      status: 'Bad request',
      data: null,
      message: "You must provide a valid user ID",
    });
  }
}

const userController = { getAllUser, getUserByID, createUser, deleteUser, updateUser };

export default userController;
