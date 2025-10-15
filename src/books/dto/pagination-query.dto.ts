import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página (desde 1)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de resultados por página',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
