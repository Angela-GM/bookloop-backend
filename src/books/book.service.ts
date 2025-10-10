import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async createBook(data: CreateBookDto & { imageUrl?: string }) {
    const { ownerId, price, ...rest } = data;

    return this.prisma.book.create({
      data: {
        ...rest,
        price: Number(price),
        owner: {
          connect: { id: ownerId },
        },
      },
    });
  }
}
