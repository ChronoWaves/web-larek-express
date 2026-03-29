import { Router } from 'express';
import {
  login,
  register,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from '../controllers/auth';
import { validateLogin, validateRegister } from '../middlewares/validators';
import auth from '../middlewares/auth';

const authRouter = Router();

authRouter.post('/login', validateLogin, login);
authRouter.post('/register', validateRegister, register);
authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', logout);
authRouter.get('/user', auth, getCurrentUser);

export default authRouter;