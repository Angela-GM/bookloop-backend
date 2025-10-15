import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(
  OmitType(CreateBookDto, ['ownerId']),
) {}
