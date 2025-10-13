import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config(); // ← Asegura que las variables estén disponibles

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-')}`,
    allowed_formats: ['jpg', 'png', 'jpeg'],
    folder: 'bookloop',
  }),
});
