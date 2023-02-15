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
router.get('/api/v1/users/:id', verifyCredentials, UserController.getUserById.bind(UserController));
router.get('/api/v1/users', verifyCredentials, UserController.getAllUsers.bind(UserController));
router.post('/api/v1/users/create', verifyCredentials, UserController.createUser.bind(UserController));
router.put('/api/v1/users/:id/update', verifyCredentials, UserController.updateUser.bind(UserController));
router.delete('/api/v1/users/:id/delete', verifyCredentials, UserController.deleteUser.bind(UserController));

/**
 * Invalid Route
 */
router.use(errorController.notFound);

/**
 * Server Error
 */
router.use(errorController.serverError)

export default router;
