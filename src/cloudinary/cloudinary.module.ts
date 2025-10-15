import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [CloudinaryProvider],
  exports: ['Cloudinary'],
})
export class CloudinaryModule {}
