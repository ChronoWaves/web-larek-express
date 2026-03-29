import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';

export interface IProductImage {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  title: string;
  image: IProductImage;
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      unique: true,
      required: [true, 'Поле "title" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "title" - 2'],
      maxlength: [30, 'Максимальная длина поля "title" - 30'],
    },
    image: {
      type: {
        fileName: {
          type: String,
          required: [true, 'Поле "image.fileName" должно быть заполнено'],
        },
        originalName: {
          type: String,
          required: [true, 'Поле "image.originalName" должно быть заполнено'],
        },
      },
      required: [true, 'Поле "image" должно быть заполнено'],
      _id: false,
    },
    category: {
      type: String,
      required: [true, 'Поле "category" должно быть заполнено'],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: null,
    },
  },
  { versionKey: false },
);

productSchema.post('findOneAndDelete', (doc) => {
  if (doc?.image?.fileName) {
    const filePath = path.join(__dirname, 'public', doc.image.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Ошибка удаления файла:', err);
      });
    }
  }
});

export default mongoose.model<IProduct>('product', productSchema);