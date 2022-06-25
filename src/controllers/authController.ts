import { Request, Response } from 'express';
import authService from '../services/authService';

const createLogin = async (req: Request, res: Response) => {
  try {
    const email: string = req.body['email'];
    const password: string = req.body['password'];
    if (email !== '' && password !== '') {
      const {login, token} = await authService.createLogin(email, password);
      if (login && token) {
        return res.status(200)
          .cookie('token', token, { httpOnly: true, path: '/', domain: 'web-aplication-352710.et.r.appspot.com' })
          .send({
            status: 'Ok',
            data: login,
            message: 'Login success'
          });
      }
      return res.status(401).send({
        status: 'Bad request',
        data: null,
        message: 'Email and password not matched',
      });
    } else {
      return res.status(400).send({
        status: 'Bad request',
        data: null,
        message: 'No email and password provided'
      });
    }
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

const deleteLogin = async (req: Request, res: Response) => {
  try {
    const userID = req.headers['user_id'] ? req.headers['user_id'].toString() : '';
    const userToken = req.headers['user_token'] ? req.headers['user_token'].toString() : '';
    await authService.deleteLogin(userID, userToken);
    return res.status(200)
    .cookie('token', '', { httpOnly: true, path: '/' })
    .send({
      status: 'Ok',
      data: null,
      message: 'Logout success',
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

const getSessionValidation = (req: Request, res: Response) => {
  return res.status(200).send({
    status: 'Ok',
    data: null,
    message: 'Success',
  });
};

const getCurrentRole = async (req: Request, res: Response) => {
  try {
    const roleID = req.headers['role_id'] ? req.headers['role_id'].toString() : '';
    const result = await authService.getCurrentRole(roleID);
    return res.status(200).send({
      status: 'Ok',
      data: { role: result.rows[0] },
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

const authController = {
  createLogin,
  deleteLogin,
  getSessionValidation,
  getCurrentRole,
};

export default authController;
