import {
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookConditionEnum } from 'src/common/enums';
import { Type } from 'class-transformer';
import { IsValidIsbn } from 'src/validators/isbn.validator';

export class CreateBookDto {
  @ApiProperty({ example: 'El nombre del viento' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Patrick Rothfuss' })
  @IsString()
  author: string;

  @ApiProperty({ example: '9783161484100', required: false })
  @IsValidIsbn({ message: 'ISBN must be valid (ISBN-10 or ISBN-13)' })
  @IsOptional()
  @IsString()
  isbn: string;

  @ApiProperty({ example: 'Fantasía épica y poética' })
  @IsString()
  description: string;

  @ApiProperty({ enum: BookConditionEnum, example: BookConditionEnum.GOOD })
  @IsEnum(BookConditionEnum)
  condition: BookConditionEnum;

  @ApiProperty({ example: 'Tarragona' })
  @IsString()
  location: string;

  @ApiProperty({ example: 4.99 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Price must be greater than 0' })
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'cmgkw5oee0000o9f8gmgg1sgi' })
  @IsString()
  ownerId: string;
}
