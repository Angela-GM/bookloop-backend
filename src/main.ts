import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Middleware para loguear TODAS las peticiones (incluso errores)
  app.use((req, res, next) => {
    const bodyStr = req.method !== 'GET' && req.body 
      ? JSON.stringify(req.body).substring(0, 100) 
      : 'N/A';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log(`  Headers: Authorization=${req.headers.authorization ? '✅' : '❌'}`);
    
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('BookLoop API')
    .setDescription(
      'API documentation for BookLoop backend<br><br><a href="/api/docs-json" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 14px;">http://localhost:3001/api/docs-json</a>',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Swagger endpoint is automatically set up by SwaggerModule
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'BookLoop API Documentation',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
