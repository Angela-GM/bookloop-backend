import { IsString, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookConditionEnum } from 'src/common/enums';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({ example: 'El nombre del viento' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Patrick Rothfuss' })
  @IsString()
  author: string;

  @ApiProperty({ example: '9788498382540' })
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

  @ApiProperty({ example: 15 })
  @IsInt()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'cmgkw5oee0000o9f8gmgg1sgi' })
  @IsString()
  ownerId: string;
}
