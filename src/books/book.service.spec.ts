import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { BookCondition } from '@prisma/client';
import { BookConditionEnum } from '../common/enums/book-condition.enum';
import { mockBook, mockPrismaService } from '../test-utils/mock-services';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

describe('BookService', () => {
  let bookService: BookService;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    const createBookDto: CreateBookDto & { imageUrl?: string } = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '9783161484100',
      description: 'Test description',
      condition: BookConditionEnum.GOOD,
      location: 'Test Location',
      price: 15.99,
      ownerId: 'user-1',
      imageUrl: 'https://test.com/image.jpg',
    };

    it('should create a book successfully', async () => {
      // Arrange
      prismaService.book.create.mockResolvedValue(mockBook);

      // Act
      const result = await bookService.createBook(createBookDto);

      // Assert
      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: {
          title: createBookDto.title,
          author: createBookDto.author,
          isbn: createBookDto.isbn,
          description: createBookDto.description,
          location: createBookDto.location,
          imageUrl: createBookDto.imageUrl,
          condition: BookCondition.GOOD,
          price: 15.99,
          owner: {
            connect: { id: createBookDto.ownerId },
          },
        },
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('findAll', () => {
    const mockBooks = [mockBook];
    const totalBooks = 1;

    it('should return paginated books with default pagination', async () => {
      // Arrange
      prismaService.$transaction.mockResolvedValue([mockBooks, totalBooks]);

      // Act
      const result = await bookService.findAll();

      // Assert
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockBooks,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalBooks: 1,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should return paginated books with custom pagination', async () => {
      // Arrange
      const paginationQuery: PaginationQueryDto = { page: 2, limit: 5 };
      prismaService.$transaction.mockResolvedValue([mockBooks, totalBooks]);

      // Act
      const result = await bookService.findAll(paginationQuery);

      // Assert
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a book when found', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(mockBook);

      // Act
      const result = await bookService.findOne('book-1');

      // Assert
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(bookService.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateBook', () => {
    const updateBookDto: UpdateBookDto = {
      title: 'Updated Book',
      description: 'Updated description',
    };

    it('should update book when user is owner', async () => {
      // Arrange
      const updatedBook = { ...mockBook, title: 'Updated Book' };
      prismaService.book.findUnique.mockResolvedValue(mockBook);
      prismaService.book.update.mockResolvedValue(updatedBook);

      // Act
      const result = await bookService.updateBook(
        'book-1',
        updateBookDto,
        undefined,
        'user-1',
        'USER',
      );

      // Assert
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: 'book-1' },
      });
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: {
          ...updateBookDto,
          imageUrl: mockBook.imageUrl,
        },
      });
      expect(result).toEqual({
        message: 'Book updated successfully',
        book: updatedBook,
      });
    });

    it('should update book when user is admin', async () => {
      // Arrange
      const updatedBook = { ...mockBook, title: 'Updated Book' };
      prismaService.book.findUnique.mockResolvedValue(mockBook);
      prismaService.book.update.mockResolvedValue(updatedBook);

      // Act
      const result = await bookService.updateBook(
        'book-1',
        updateBookDto,
        undefined,
        'admin-1',
        'ADMIN',
      );

      // Assert
      expect(prismaService.book.update).toHaveBeenCalled();
      expect(result.message).toBe('Book updated successfully');
    });

    it('should throw NotFoundException when book does not exist', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        bookService.updateBook(
          'non-existent',
          updateBookDto,
          undefined,
          'user-1',
          'USER',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner or admin', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(mockBook);

      // Act & Assert
      await expect(
        bookService.updateBook(
          'book-1',
          updateBookDto,
          undefined,
          'other-user',
          'USER',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update image URL when file is provided', async () => {
      // Arrange
      const file = {
        path: 'https://new-image.com/image.jpg',
      } as Express.Multer.File;
      const updatedBook = { ...mockBook, imageUrl: file.path };
      prismaService.book.findUnique.mockResolvedValue(mockBook);
      prismaService.book.update.mockResolvedValue(updatedBook);

      // Act
      await bookService.updateBook(
        'book-1',
        updateBookDto,
        file,
        'user-1',
        'USER',
      );

      // Assert
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: {
          ...updateBookDto,
          imageUrl: file.path,
        },
      });
    });
  });

  describe('deleteBook', () => {
    it('should delete book when user is owner', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(mockBook);
      prismaService.book.delete.mockResolvedValue(mockBook);

      // Act
      const result = await bookService.deleteBook('book-1', 'user-1', 'USER');

      // Assert
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: 'book-1' },
      });
      expect(prismaService.book.delete).toHaveBeenCalledWith({
        where: { id: 'book-1' },
      });
      expect(result).toEqual({
        message: 'Book deleted successfully',
        deletedBookId: 'book-1',
      });
    });

    it('should delete book when user is admin', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(mockBook);
      prismaService.book.delete.mockResolvedValue(mockBook);

      // Act
      const result = await bookService.deleteBook('book-1', 'admin-1', 'ADMIN');

      // Assert
      expect(prismaService.book.delete).toHaveBeenCalled();
      expect(result.message).toBe('Book deleted successfully');
    });

    it('should throw NotFoundException when book does not exist', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        bookService.deleteBook('non-existent', 'user-1', 'USER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner or admin', async () => {
      // Arrange
      prismaService.book.findUnique.mockResolvedValue(mockBook);

      // Act & Assert
      await expect(
        bookService.deleteBook('book-1', 'other-user', 'USER'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
