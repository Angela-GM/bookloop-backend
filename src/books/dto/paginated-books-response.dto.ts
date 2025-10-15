import { ApiProperty } from '@nestjs/swagger';
import { BookResponseDto } from './books-response.dto';

export class PaginationInfoDto {
  @ApiProperty({ example: 1, description: 'Página actual' })
  currentPage: number;

  @ApiProperty({ example: 5, description: 'Total de páginas disponibles' })
  totalPages: number;

  @ApiProperty({ example: 50, description: 'Total de libros' })
  totalBooks: number;

  @ApiProperty({ example: 10, description: 'Límite de resultados por página' })
  limit: number;

  @ApiProperty({
    example: true,
    description: 'Indica si existe página siguiente',
  })
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si existe página anterior',
  })
  hasPreviousPage: boolean;
}

export class PaginatedBooksResponseDto {
  @ApiProperty({
    type: [BookResponseDto],
    description: 'Lista de libros en la página actual',
  })
  data: BookResponseDto[];

  @ApiProperty({
    type: PaginationInfoDto,
    description: 'Información de paginación',
  })
  pagination: PaginationInfoDto;
}
