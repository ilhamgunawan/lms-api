import ErrorReporterService from "./ErrorReporter";
import { Request, Response } from "express";
import { Knex } from "knex";
import { responseStatus, messages, errorName } from "../utils/constant";

export interface ControllerErrorHandler {
  req: Request
  res: Response
  trx?: Knex.Transaction
  e: unknown
  controller: string
}

export default class ErrorHandlerService {
  private message: string;
  private status: number;

  constructor() {
    this.message = messages.general;
    this.status = responseStatus.internalServerError;
  }

  async controllerHandler(params: ControllerErrorHandler) {
    const { req, res, trx, e, controller } = params;

    if (e instanceof Error) {
      this.message = e.message;

      if (e.name === errorName.missingFields) {
        this.message = messages.missingFields(JSON.parse(e.message).join(', '));
        this.status = responseStatus.badRequest;
      }

      if (e.name === errorName.badTimestampFormat) {
        this.status = responseStatus.badRequest;
      }

      if (e.name === errorName.duplicateUsername) {
        this.status = responseStatus.badRequest;
        this.message = messages.duplicateUsername(req.body.user_name);
      }

      if (e.name === errorName.notFound) {
        this.status = responseStatus.notFound;
      }

      if (e.name === errorName.invalidLogin) {
        this.status = responseStatus.badRequest;
      }

      if (e.name === errorName.invalidJwtSecret) {
        this.message = messages.general;
      }

      if (e.name === errorName.invalidToken) {
        this.status = responseStatus.unauthorized;
        this.message = messages.invalidToken;
      }

      if (e.name === errorName.tokenExpired) {
        this.status = responseStatus.unauthorized;
        this.message = messages.tokenExpired;
      }
    }

    ErrorReporterService.controllerError({
      controller,
      message: this.message,
    });

    if (trx) await trx.rollback();

    return res.status(this.status).send({ message: this.message });
  }
}
