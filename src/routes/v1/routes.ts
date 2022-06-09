import express, { Router } from 'express';
import authController from '../../controllers/authController';
import errorController from '../../controllers/errorController';
import { verifyToken } from '../../middlewares/middlewares';

const router: Router = express.Router();

/**
 * Authentication
 */
router.post('/api/v1/auth/login', authController.createLogin);
router.post('/api/v1/auth/logout', verifyToken, authController.deleteLogin);
router.get('/api/v1/auth/role', verifyToken, authController.getCurrentRole);
router.get('/api/v1/auth/session', verifyToken, authController.getSessionValidation);

/**
 * Invalid Route
 */
router.use(errorController.notFound);

/**
 * Server Error
 */
router.use(errorController.serverError)

export default router;
