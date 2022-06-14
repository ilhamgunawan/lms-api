import express, { Router } from 'express';
import authController from '../../controllers/authController';
import userController from '../../controllers/userController';
import errorController from '../../controllers/errorController';
import middlewares from '../../middlewares/middlewares';

const router: Router = express.Router();
const {verifyToken} = middlewares;

/**
 * Authentication
 */
router.post('/api/v1/auth/login', authController.createLogin);
router.delete('/api/v1/auth/logout', verifyToken, authController.deleteLogin);
router.get('/api/v1/auth/role', verifyToken, authController.getCurrentRole);
router.get('/api/v1/auth/session', verifyToken, authController.getSessionValidation);

/**
 * Users
 */
router.get('/api/v1/users', verifyToken, userController.getAllUser);
router.get('/api/v1/users/:id', verifyToken, userController.getUserByID);
// TODO: Add create user controller, add delete user controller, add update user controller
router.post('/api/v1/users/create', verifyToken, userController.createUser);
router.patch('/api/v1/users/update/:id');
router.delete('/api/v1/users/delete/:id');

/**
 * Invalid Route
 */
router.use(errorController.notFound);

/**
 * Server Error
 */
router.use(errorController.serverError)

export default router;
