// src/books/dto/create-book.dto.ts
import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { BookCondition } from '@prisma/client';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(BookCondition)
  condition: BookCondition;

  @IsString()
  location: string;

  @IsInt()
  price: number;

  @IsString()
  ownerId: string;
}
