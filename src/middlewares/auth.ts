import { Request, Response, NextFunction } from "express";
import AuthService from "../services/Auth";
import ErrorReporterService from "../services/ErrorReporter";
import { errorName, messages, responseStatus } from "../utils/constant";

async function verifyCredentials(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error(messages.invalidAuthHeader);
      err.name = errorName.invalidAuthHeader;
      throw err;
    }

    const verifyTokenResult = await AuthService.verifyToken(authHeader);
    if (verifyTokenResult.err) throw verifyTokenResult.err;

    if (!verifyTokenResult.data) {
      const err = new Error(messages.invalidToken);
      err.name = errorName.invalidToken;
      throw err;
    }

    return next();
  } catch(e) {
    let message = messages.general;
    let status = responseStatus.internalServerError;

    if (e instanceof Error) {
      message = e.message;

      if (e.name === errorName.invalidAuthHeader) status = responseStatus.unauthorized;

      if (e.message.includes('jwt malformed')) {
        message = messages.invalidToken;
        status = responseStatus.unauthorized;
      }
    }

    ErrorReporterService.controllerError({
      controller: 'auth.middlewares.verifyCredentials',
      message,
    });

    return res.status(status).send({ message });
  }
}

const authMiddlewares = {
  verifyCredentials,
};

export default authMiddlewares;
