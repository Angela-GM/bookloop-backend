import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  Put,
  Param,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBookDto } from './dto/create-book.dto';
import { BookService } from './book.service';
import { Express } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedBooksResponseDto } from './dto/paginated-books-response.dto';
import { storage } from 'src/cloudinary/cloudinary.config';
import { UpdateBookDto } from './dto/update-book.dto';
import { RequestWithUser } from 'src/common/types/request-with-user.interface';
import { AuthGuard } from '@nestjs/passport';
import { BookResponseDto } from './dto/books-response.dto';

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

  @ApiResponse({ status: 200, type: PaginatedBooksResponseDto })
  @Get()
  @ApiOperation({ summary: 'Get all books with pagination' })
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.bookService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find book for ID' })
  @ApiResponse({ status: 200, type: BookResponseDto })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async findOne(@Param('id') id: string): Promise<BookResponseDto> {
    return this.bookService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Edit book for ID' })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  async updateBook(
    @Param('id') id: string,
    @Body() body: UpdateBookDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.bookService.updateBook(
      id,
      body,
      file,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete book for ID' })
  @ApiResponse({ status: 200, description: 'Book deleted success' })
  async deleteBook(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.bookService.deleteBook(id, req.user.id, req.user.role);
  }
}
