import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Bookloop backend is running 🚀',
      timestamp: new Date().toDateString(),
    };
  }
}
