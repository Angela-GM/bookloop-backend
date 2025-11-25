import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('Cloudinary') private cloudinary: any) {}

  /**
   * Sube un archivo a Cloudinary
   */
  async uploadFile(filePath: string): Promise<string> {
    const response = await this.cloudinary.uploader.upload(filePath, {
      folder: 'bookloop/books',
      resource_type: 'auto',
    });
    return response.secure_url;
  }
}