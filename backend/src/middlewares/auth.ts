import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { UnauthorizedError } from '../errors';

interface JwtPayload {
  _id: string;
}

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
    req.user = { _id: payload._id };
    return next();
  } catch {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default auth;
