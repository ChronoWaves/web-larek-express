import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Error as MongooseError } from 'mongoose';
import User from '../models/user';
import config from '../config';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../errors';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { _id: userId },
    config.jwtAccessSecret,
    { expiresIn: '10m' },
  );
  const refreshToken = jwt.sign(
    { _id: userId },
    config.jwtRefreshSecret,
    { expiresIn: '7d' },
  );
  return { accessToken, refreshToken };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
    );

    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } },
    });

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(
        new ConflictError('Пользователь с таким email уже существует'),
      );
    }
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +tokens');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
    );

    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } },
    });

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken: token } = req.cookies;

    if (!token) {
      throw new UnauthorizedError('Необходима авторизация');
    }

    let payload: { _id: string };
    try {
      payload = jwt.verify(token, config.jwtRefreshSecret) as { _id: string };
    } catch {
      throw new UnauthorizedError('Токен просрочен или невалиден');
    }

    const user = await User.findOne({
      _id: payload._id,
      'tokens.token': token,
    }).select('+tokens');

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    await User.findByIdAndUpdate(user._id, {
      $pull: { tokens: { token } },
    });

    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
    );

    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } },
    });

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken: token } = req.cookies;

    if (!token) {
      throw new UnauthorizedError('Необходима авторизация');
    }

    let payload: { _id: string };
    try {
      payload = jwt.verify(token, config.jwtRefreshSecret) as { _id: string };
    } catch {
      throw new UnauthorizedError('Токен просрочен или невалиден');
    }

    if (!payload._id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Невалидный ID пользователя');
    }

    const user = await User.findByIdAndUpdate(payload._id, {
      $pull: { tokens: { token } },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.json({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};