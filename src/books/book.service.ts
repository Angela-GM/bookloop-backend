import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { BookCondition } from '@prisma/client';
import { PaginationQueryDto } from './dto/pagination-query.dto';

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

  async findAll() {
    return this.prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
