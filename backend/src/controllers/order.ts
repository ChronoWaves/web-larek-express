import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import { BadRequestError } from '../errors';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      items, total, payment: _payment, email: _email, phone: _phone, address: _address,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Поле "items" должно быть непустым массивом');
    }

    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      throw new BadRequestError(
        'Один или несколько товаров не найдены в базе данных',
      );
    }

    const unsellable = products.find((p) => p.price === null);
    if (unsellable) {
      throw new BadRequestError(
        `Товар "${unsellable.title}" не продаётся (цена не указана)`,
      );
    }

    const calculatedTotal = products.reduce(
      (sum, p) => sum + (p.price || 0),
      0,
    );
    if (calculatedTotal !== total) {
      throw new BadRequestError(
        `Сумма заказа не совпадает: ожидается ${calculatedTotal}, получено ${total}`,
      );
    }

    const orderId = faker.string.uuid();

    res.status(201).json({ id: orderId, total });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
