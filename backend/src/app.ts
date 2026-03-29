import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import config from './config';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import { NotFoundError } from './errors';

const app = express();

app.use(cors({
  origin: config.originAllow,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose
  .connect(config.dbAddress)
  .then(() => {
    console.log('Подключение к MongoDB установлено');
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err);
  });

app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port}`);
});