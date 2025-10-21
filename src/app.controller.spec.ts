import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return bookloop backend message', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty(
        'message',
        'Bookloop backend is running 🚀',
      );
      expect(result).toHaveProperty('timestamp');
    });
  });
});
