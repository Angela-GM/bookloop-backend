import { ApiProperty } from '@nestjs/swagger';

export class BookResponseDto {
  @ApiProperty({ example: 'cmgkw5oee0000o9f8gmgg1sgi' })
  id: string;

  @ApiProperty({ example: 'El nombre del viento' })
  title: string;

  @ApiProperty({ example: 'Patrick Rothfuss' })
  author: string;

  @ApiProperty({ example: '9788498382540', required: false })
  isbn?: string;

  @ApiProperty({ example: 'Fantasía épica y poética', required: false })
  description?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({ example: 'GOOD', enum: ['NEW', 'GOOD', 'FAIR', 'POOR'] })
  condition: string;

  @ApiProperty({ example: true })
  available: boolean;

  @ApiProperty({ example: 15 })
  price: number;

  @ApiProperty({ example: 'Tarragona' })
  location: string;

  @ApiProperty({ example: '2025-10-13T15:03:07.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-13T15:03:07.000Z' })
  updatedAt: Date;

  @ApiProperty({
    example: {
      id: 'user123',
      name: 'Ángela García',
    },
  })
  owner: {
    id: string;
    name: string;
  };
}
