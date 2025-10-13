import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  try {
    const config = new DocumentBuilder()
      .setTitle('Bookloop API')
      .setDescription(
        'Documentación interactiva de la API para gestión de libros',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  } catch (error) {
    console.error('Error al generar Swagger:', error);
  }
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API levantada en el puerto ${port}`);
}
bootstrap();
