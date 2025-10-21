import { User, Book, BookCondition } from '@prisma/client';

export const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdminUser: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'hashedPassword',
  role: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBook: Book = {
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  isbn: '9783161484100',
  description: 'Test description',
  condition: BookCondition.GOOD,
  location: 'Test Location',
  price: 16, // Changed to integer to match Prisma schema
  imageUrl: 'https://test.com/image.jpg',
  available: true,
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBookWithOwner = {
  ...mockBook,
  owner: {
    id: mockUser.id,
    name: mockUser.name,
  },
};

export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  book: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((operations) => {
    if (Array.isArray(operations)) {
      return Promise.resolve(operations.map(() => mockBook));
    }
    return Promise.resolve([]);
  }),
};

export const mockJwtService = {
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(),
  decode: jest.fn(),
};

export const createMockRequest = (user?: Partial<User>) => ({
  user: user || mockUser,
  headers: {},
  query: {},
  params: {},
  body: {},
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
};
