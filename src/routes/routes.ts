import express, { NextFunction, Router, Request, Response } from 'express';
import errors from '../models/errors/errors';
import { makeResponse, makeErrorResponse, makeLog } from '../utils/utils';
import { authController, usersController, menusController } from '../controllers/controllers';
import { verifyToken } from '../middlewares/middlewares';

const router: Router = express.Router();

/**
 * Authentication
 */
router.post('/auth/login', authController.loginController.login);
router.post('/auth/logout', (req, res, next) => {
  verifyToken(req, res, next);
}, authController.logoutController.post);
router.get('/auth/current-role', (req, res, next) => {
  verifyToken(req, res, next);
}, authController.currentRoleController.get);
router.get('/auth/validate-session', (req, res, next) => {
  verifyToken(req, res, next);
}, (_req, res) => {
  return makeResponse(res, 200, { message: 'Session valid' });
});

/**
 * Menus
 */
router.get('/menus', (req, res, next) => {
  verifyToken(req, res, next);
}, menusController.getMenus);

/**
 * Users
 */
router.get('/users', (req, res, next) => {
  verifyToken(req, res, next);
}, usersController.getAllUsers);

/**
 * Invalid Route
 */
router.use((_req, res, _next) => {
  return makeResponse(res, 404, makeErrorResponse(errors.message.invalidRoute, errors.code.invalidRoute));
});

/**
 * Server Error
 */
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  makeLog('server-error', { name: err.name, message: err.message, stack: err.stack});
  return makeResponse(res, 500, makeErrorResponse(errors.message.general, errors.code.general));
})

export default router;
