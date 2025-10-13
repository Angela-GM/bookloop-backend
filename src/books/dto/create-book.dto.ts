import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookConditionEnum } from '../enums/book-condition.enum';

export class CreateBookDto {
  @ApiProperty({ example: 'El nombre del viento' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Patrick Rothfuss' })
  @IsString()
  author: string;

  @ApiPropertyOptional({ example: '9788498382540' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({ example: 'Fantasía épica y poética' })
  @IsOptional()
  @IsString()
  description?: string;

  // @ApiProperty({ enum: BookConditionEnum, example: BookConditionEnum.GOOD })
  @IsEnum(BookConditionEnum)
  condition: BookConditionEnum;

  @ApiProperty({ example: 'Tarragona' })
  @IsString()
  location: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  price: number;

  @ApiProperty({ example: 'cmgkw5oee0000o9f8gmgg1sgi' })
  @IsString()
  ownerId: string;
}
