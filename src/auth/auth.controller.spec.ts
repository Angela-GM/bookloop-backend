import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  mockUser,
  createMockRequest,
  createMockResponse,
} from '../test-utils/mock-services';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      const expectedResponse = {
        message: 'Successfully registered user',
        user: mockUser,
      };
      authService.register.mockResolvedValue(expectedResponse);

      // Act
      const result = await authController.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate errors from auth service', async () => {
      // Arrange
      const error = new Error('Email already exists');
      authService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(authController.register(registerDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully and set cookie', async () => {
      // Arrange
      const mockResponse = createMockResponse();
      const token = 'mock-jwt-token';
      const expectedResponse = {
        message: 'Login exitoso',
        token,
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue(token);

      // Act
      const result = await authController.login(loginDto, mockResponse);

      // Assert
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate validation errors', async () => {
      // Arrange
      const mockResponse = createMockResponse();
      const error = new Error('Invalid credentials');
      authService.validateUser.mockRejectedValue(error);

      // Act & Assert
      await expect(
        authController.login(loginDto, mockResponse),
      ).rejects.toThrow(error);
      expect(authService.login).not.toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('whoAmI', () => {
    it('should return authenticated user', async () => {
      // Arrange
      const mockRequest = createMockRequest(mockUser);

      // Act
      const result = await authController.whoAmI(mockRequest as any);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return user from request', async () => {
      // Arrange
      const customUser = { ...mockUser, name: 'Custom User' };
      const mockRequest = createMockRequest(customUser);

      // Act
      const result = await authController.whoAmI(mockRequest as any);

      // Assert
      expect(result).toEqual(customUser);
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success message', async () => {
      // Arrange
      const mockResponse = createMockResponse();
      const expectedResponse = { message: 'Sesión cerrada' };

      // Act
      const result = await authController.logout(mockResponse);

      // Assert
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('token');
      expect(result).toEqual(expectedResponse);
    });
  });
});
