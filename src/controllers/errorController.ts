import {Request, Response} from 'express';

const notFound = (req: Request, res: Response) => {
  return res.status(404).send({
    status: "Not Found",
    data: null,
  });
};

const serverError = (req: Request, res: Response) => {
  return res.status(500).send({
    status: "Internal server error",
    data: null,
  });
};

const errorController = {notFound, serverError};

export default errorController;
