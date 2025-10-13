import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
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
}
