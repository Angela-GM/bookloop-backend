import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { BookCondition } from '@prisma/client';
import { UpdateBookDto } from './dto/update-book.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async createBook(
    data: CreateBookDto & { imageUrl?: string; localImagePath?: string },
  ) {
    const { ownerId, price, condition, localImagePath, imageUrl, ...rest } =
      data;

    console.log('📚 createBook recibió:', {
      ownerId,
      price,
      condition,
      localImagePath,
      imageUrl,
      restKeys: Object.keys(rest),
    });

    const prismaCondition =
      BookCondition[condition as keyof typeof BookCondition];
    let finalImageUrl: string | undefined;

    if (localImagePath) {
      console.log('📤 Subiendo archivo a Cloudinary:', localImagePath);
      finalImageUrl = await this.cloudinaryService.uploadFile(localImagePath);
      console.log('✅ Archivo subido. URL:', finalImageUrl);
    } else if (imageUrl) {
      console.log('🔗 Usando URL directa:', imageUrl);
      finalImageUrl = imageUrl;
    }

    console.log('💾 Guardando en BD con imageUrl:', finalImageUrl);

    return this.prisma.book.create({
      data: {
        ...rest,
        imageUrl: finalImageUrl,
        condition: prismaCondition,
        price: Number(price),
        owner: {
          connect: { id: ownerId },
        },
      },
    });
  }

  async findAll(paginationQuery?: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery || {};
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [books, totalBooks] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.book.count(),
    ]);

    const totalPages = Math.ceil(totalBooks / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return {
      data: books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        limit: limitNum,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Book with id ${id} not found');
    }

    return book;
  }

  async updateBook(
    id: string,
    data: UpdateBookDto,
    image: Express.Multer.File | undefined,
    userId: string,
    role: 'USER' | 'ADMIN',
  ) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);

    const isOwner = book.ownerId === userId;
    const isAdmin = role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not permitted to edit this book.');
    }

    const imageUrl = image?.path || book.imageUrl;

    const updatedBook = await this.prisma.book.update({
      where: { id },
      data: {
        ...data,
        imageUrl,
      },
    });

    return {
      message: 'Book updated successfully',
      book: updatedBook,
    };
  }

  async deleteBook(id: string, userId: string, role: 'USER' | 'ADMIN') {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const isOwner = book.ownerId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not permitted to delete this book.',
      );
    }
    await this.prisma.book.delete({ where: { id } });

    return {
      message: 'Book deleted successfully',
      deletedBookId: id,
    };
  }
}
