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
  const body = req.body;
  return res.status(200).send({
    status: 'Ok',
    data: { user: body },
    message: 'Success',
  });
}

const userController = { getAllUser, getUserByID, createUser };

export default userController;
