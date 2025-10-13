import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { storage } from '../cloudinary/cloudinary.config';
import { CreateBookDto } from './dto/create-book.dto';
import { BookService } from './book.service';
import { Express } from 'express'; // ← Asegurate de tener esto
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { BookResponseDto } from './dto/books-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { storage } from 'src/cloudinary/cloudinary.config';

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create new book' })
  @ApiResponse({ status: 201, description: 'Book create success' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'El nombre del viento' },
        author: { type: 'string', example: 'Patrick Rothfuss' },
        isbn: { type: 'string', example: '9788498382540' },
        description: { type: 'string', example: 'Fantasía épica y poética' },
        condition: { type: 'string', enum: ['GOOD', 'EXCELLENT', 'POOR'] },
        location: { type: 'string', example: 'Tarragona' },
        price: { type: 'integer', example: 15 },
        ownerId: { type: 'string', example: 'cmgkw5oee0000o9f8gmgg1sgi' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'title',
        'author',
        'isbn',
        'description',
        'condition',
        'location',
        'price',
        'ownerId',
        'image',
      ],
    },
  })
  @UseInterceptors(FileInterceptor('image', { storage }))
  async createBook(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateBookDto,
  ) {
    return this.bookService.createBook({ ...body, imageUrl: file?.path });
  }

  @ApiResponse({ status: 200, type: BookResponseDto, isArray: true })
  @Get()
  @ApiOperation({ summary: 'Get all books' })
  async findAll() {
    return this.bookService.findAll();
  }
}
