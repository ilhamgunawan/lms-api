import { Request, Response } from 'express';
import authService from '../services/authService';

const createLogin = (req: Request, res: Response) => {
  const createdLogin = authService.createLogin();
  res.send("Create a new login");
};

const deleteLogin = (req: Request, res: Response) => {
  authService.deleteLogin();
  res.send("Delete an existing login session");
};

const getSessionValidation = (req: Request, res: Response) => {
  const isSessionValid = authService.getSessionStatus();
  res.send("Get session validation status");
};

const getCurrentRole = (req: Request, res: Response) => {
  const currentRole = authService.getCurrentRole();
  res.send("Get current active role");
};

const authController = {
  createLogin,
  deleteLogin,
  getSessionValidation,
  getCurrentRole,
};

export default authController;
