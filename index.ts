import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
const envFilePath = `./.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envFilePath });

import router from './src/routes/v1/routes';
import db from './src/database/db';

const app: Express = express();
const port = process.env.PORT;

app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);
// db.init();
app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
