import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле "email" должно быть заполнено'],
      unique: true,
      validate: {
        validator: (v: string) => validator.isEmail(v),
        message: 'Некорректный формат email',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      minlength: [6, 'Минимальная длина поля "password" - 6'],
      select: false,
    },
    tokens: {
      type: [
        {
          token: { type: String, required: true },
          _id: false,
        },
      ],
      default: [],
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.pre('save', async function hashPassword(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model<IUserDocument>('user', userSchema);