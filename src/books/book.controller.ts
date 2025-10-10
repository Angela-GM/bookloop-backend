import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/cloudinary/cloudinary.config';
import { CreateBookDto } from './dto/create-book.dto';
import { BookService } from './book.service';
import { Express } from 'express'; // ← Asegurate de tener esto

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async createBook(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateBookDto,
  ) {
    return this.bookService.createBook({ ...body, imageUrl: file?.path });
  }
}
