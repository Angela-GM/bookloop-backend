import { ApiProperty } from '@nestjs/swagger';
import { BookCondition } from '@prisma/client';

export class BookOwnerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class BookResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  isbn: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  imageUrl: string | null;

  @ApiProperty({ enum: BookCondition })
  condition: BookCondition;

  @ApiProperty()
  available: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  location: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ type: BookOwnerDto })
  owner: BookOwnerDto;
}
