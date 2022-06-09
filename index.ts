import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { makeLog } from './src/utils/utils';
import dotenv from 'dotenv';
dotenv.config();

import router from './src/routes/routes';
import { client } from './src/services/db';

const app: Express = express();
const port = process.env.PORT === undefined ? '7002' : process.env.PORT;

app.use(cors({
  origin: 'http://localhost:7001',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(router);

client.connect()
  .then(() => makeLog('db-connection', 'success', true))
  .catch((e: Error) => makeLog('db-connection', e.stack ? e.stack : e, true));

app.listen(port, () => makeLog('server', `Server is running at http://localhost:${port}`));
