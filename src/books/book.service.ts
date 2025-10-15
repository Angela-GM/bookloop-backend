import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { BookCondition } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async createBook(data: CreateBookDto & { imageUrl?: string }) {
    const { ownerId, price, condition, ...rest } = data;

    const prismaCondition =
      BookCondition[condition as keyof typeof BookCondition];

    return this.prisma.book.create({
      data: {
        ...rest,
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
}
