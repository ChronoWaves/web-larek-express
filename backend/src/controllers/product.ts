import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import fs from 'fs';
import path from 'path';
import Product from '../models/product';
import {
  BadRequestError, ConflictError, NotFoundError,
} from '../errors';
import config from '../config';

const moveFile = (fileName: string) => {
  const baseName = path.basename(fileName);
  const src = path.join(__dirname, '..', config.uploadPathTemp, baseName);
  const dest = path.join(__dirname, 'public', config.uploadPath, baseName);

  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
  }
};

export const getProducts = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  Product.find({})
    .then((products) => {
      res.json({ items: products, total: products.length });
    })
    .catch(next);
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    if (image?.fileName) {
      moveFile(image.fileName);
    }

    const product = await Product.create({
      title, image, category, description, price,
    });

    return res.status(201).json(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(
        new ConflictError('Товар с таким названием уже существует'),
      );
    }
    return next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    if (updateData.image?.fileName) {
      moveFile(updateData.image.fileName);
    }

    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new NotFoundError('Товар не найден');
    }

    return res.json(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(
        new ConflictError('Товар с таким названием уже существует'),
      );
    }
    return next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      throw new NotFoundError('Товар не найден');
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
};
