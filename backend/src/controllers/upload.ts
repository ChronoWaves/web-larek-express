import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors';

const uploadFile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Файл не загружен');
    }

    const { filename, originalname } = req.file;

    res.json({
      fileName: `/images/${filename}`,
      originalName: originalname,
    });
  } catch (error) {
    next(error);
  }
};

export default uploadFile;
