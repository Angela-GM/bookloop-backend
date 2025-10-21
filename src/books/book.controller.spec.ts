import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { BookConditionEnum } from '../common/enums/book-condition.enum';
import {
  mockBook,
  mockBookWithOwner,
  mockUser,
  createMockRequest,
} from '../test-utils/mock-services';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: jest.Mocked<BookService>;

  beforeEach(async () => {
    const mockBookService = {
      createBook: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [{ provide: BookService, useValue: mockBookService }],
    }).compile();

    bookController = module.get<BookController>(BookController);
    bookService = module.get(BookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    const createBookDto: CreateBookDto = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '9783161484100',
      description: 'Test description',
      condition: BookConditionEnum.GOOD,
      location: 'Test Location',
      price: 15.99,
      ownerId: 'user-1',
    };

    const mockFile = {
      path: 'https://test.com/image.jpg',
      filename: 'test.jpg',
    } as Express.Multer.File;

    it('should create a book successfully with image', async () => {
      // Arrange
      bookService.createBook.mockResolvedValue(mockBook);

      // Act
      const result = await bookController.createBook(mockFile, createBookDto);

      // Assert
      expect(bookService.createBook).toHaveBeenCalledWith({
        ...createBookDto,
        imageUrl: mockFile.path,
      });
      expect(result).toEqual(mockBook);
    });

    it('should create a book successfully without image', async () => {
      // Arrange
      bookService.createBook.mockResolvedValue(mockBook);

      // Act
      const result = await bookController.createBook(undefined, createBookDto);

      // Assert
      expect(bookService.createBook).toHaveBeenCalledWith({
        ...createBookDto,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockBook);
    });

    it('should propagate errors from book service', async () => {
      // Arrange
      const error = new Error('Creation failed');
      bookService.createBook.mockRejectedValue(error);

      // Act & Assert
      await expect(
        bookController.createBook(mockFile, createBookDto),
      ).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
    const mockResponse = {
      data: [mockBookWithOwner],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalBooks: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    it('should return paginated books', async () => {
      // Arrange
      bookService.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await bookController.findAll(paginationQuery);

      // Assert
      expect(bookService.findAll).toHaveBeenCalledWith(paginationQuery);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty pagination query', async () => {
      // Arrange
      bookService.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await bookController.findAll({});

      // Assert
      expect(bookService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a book by ID', async () => {
      // Arrange
      bookService.findOne.mockResolvedValue(mockBookWithOwner);

      // Act
      const result = await bookController.findOne('book-1');

      // Assert
      expect(bookService.findOne).toHaveBeenCalledWith('book-1');
      expect(result).toEqual(mockBookWithOwner);
    });

    it('should propagate NotFoundException from service', async () => {
      // Arrange
      const error = new Error('Book not found');
      bookService.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(bookController.findOne('non-existent')).rejects.toThrow(
        error,
      );
    });
  });

  describe('updateBook', () => {
    const updateBookDto: UpdateBookDto = {
      title: 'Updated Book',
      description: 'Updated description',
    };

    const mockFile = {
      path: 'https://test.com/new-image.jpg',
      filename: 'new-image.jpg',
    } as Express.Multer.File;

    const mockRequest = createMockRequest(mockUser);
    const mockResponse = {
      message: 'Book updated successfully',
      book: { ...mockBook, title: 'Updated Book' },
    };

    it('should update book successfully with image', async () => {
      // Arrange
      bookService.updateBook.mockResolvedValue(mockResponse);

      // Act
      const result = await bookController.updateBook(
        'book-1',
        updateBookDto,
        mockFile,
        mockRequest as any,
      );

      // Assert
      expect(bookService.updateBook).toHaveBeenCalledWith(
        'book-1',
        updateBookDto,
        mockFile,
        mockUser.id,
        mockUser.role,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update book successfully without image', async () => {
      // Arrange
      bookService.updateBook.mockResolvedValue(mockResponse);

      // Act
      const result = await bookController.updateBook(
        'book-1',
        updateBookDto,
        undefined,
        mockRequest as any,
      );

      // Assert
      expect(bookService.updateBook).toHaveBeenCalledWith(
        'book-1',
        updateBookDto,
        undefined,
        mockUser.id,
        mockUser.role,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from book service', async () => {
      // Arrange
      const error = new Error('Update failed');
      bookService.updateBook.mockRejectedValue(error);

      // Act & Assert
      await expect(
        bookController.updateBook(
          'book-1',
          updateBookDto,
          mockFile,
          mockRequest as any,
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteBook', () => {
    const mockRequest = createMockRequest(mockUser);
    const mockResponse = {
      message: 'Book deleted successfully',
      deletedBookId: 'book-1',
    };

    it('should delete book successfully', async () => {
      // Arrange
      bookService.deleteBook.mockResolvedValue(mockResponse);

      // Act
      const result = await bookController.deleteBook(
        'book-1',
        mockRequest as any,
      );

      // Assert
      expect(bookService.deleteBook).toHaveBeenCalledWith(
        'book-1',
        mockUser.id,
        mockUser.role,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from book service', async () => {
      // Arrange
      const error = new Error('Delete failed');
      bookService.deleteBook.mockRejectedValue(error);

      // Act & Assert
      await expect(
        bookController.deleteBook('book-1', mockRequest as any),
      ).rejects.toThrow(error);
    });

    it('should work with admin user', async () => {
      // Arrange
      const adminRequest = createMockRequest({
        ...mockUser,
        role: 'ADMIN',
      });
      bookService.deleteBook.mockResolvedValue(mockResponse);

      // Act
      const result = await bookController.deleteBook(
        'book-1',
        adminRequest as any,
      );

      // Assert
      expect(bookService.deleteBook).toHaveBeenCalledWith(
        'book-1',
        mockUser.id,
        'ADMIN',
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
