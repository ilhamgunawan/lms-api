import express, { Router } from 'express';
import AuthController from '../../controllers/Auth';
import UserController from '../../controllers/User';
import errorController from '../../controllers/errorController';
import middlewares from '../../middlewares/middlewares';
import authMiddlewares from '../../middlewares/auth';

const router: Router = express.Router();
const {verifyToken} = middlewares;
const { verifyCredentials } = authMiddlewares;

/**
 * Authentication
 */
// router.post('/api/v1/auth/login', authController.createLogin);
// router.delete('/api/v1/auth/logout', verifyToken, authController.deleteLogin);
// router.get('/api/v1/auth/role', verifyToken, authController.getCurrentRole);
// router.get('/api/v1/auth/session', verifyToken, authController.getSessionValidation);
router.post('/api/v1/auth/login', AuthController.login.bind(AuthController));
router.post('/api/v1/auth/validate', AuthController.validateToken.bind(AuthController));

/**
 * Users
 */
// router.get('/api/v1/users', verifyToken, userController.getAllUser);
// router.get('/api/v1/users/:id', verifyToken, userController.getUserByID);
// router.post('/api/v1/users/create', verifyToken, userController.createUser);
// router.patch('/api/v1/users/:id/update', verifyToken, userController.updateUser);
// router.delete('/api/v1/users/:id/delete', verifyToken, userController.deleteUser);
router.get('/api/v1/users/:id', verifyCredentials, UserController.getUserById.bind(UserController));
router.post('/api/v1/users/create', verifyCredentials, UserController.createUser.bind(UserController));

/**
 * Invalid Route
 */
router.use(errorController.notFound);

/**
 * Server Error
 */
router.use(errorController.serverError)

export default router;
