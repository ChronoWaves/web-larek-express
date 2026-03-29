import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/product';
import {
  validateProductBody, validateProductUpdate, validateProductId,
} from '../middlewares/validators';
import auth from '../middlewares/auth';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', auth, validateProductBody, createProduct);
productRouter.patch('/:productId', auth, validateProductUpdate, updateProduct);
productRouter.delete('/:productId', auth, validateProductId, deleteProduct);

export default productRouter;
