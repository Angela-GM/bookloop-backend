import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar graceful shutdown hooks
  app.enableShutdownHooks();
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
  const desiredPort = Number(process.env.PORT) || 3002;
  const port = await listenOnAvailablePort(app, desiredPort);
  if (port !== desiredPort) {
    console.warn(
      `El puerto ${desiredPort} estaba en uso. API levantada en el puerto ${port}`,
    );
  } else {
    console.log(`API levantada en el puerto ${port}`);
  }

  // Manejar señales de sistema para graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(
      `\n🔄 Recibida señal ${signal}, cerrando servidor gracefully...`,
    );
    try {
      await app.close();
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error al cerrar servidor:', error);
      process.exit(1);
    }
  };

  // Capturar señales de terminación
  process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Terminación del sistema
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

  // Manejar errores no capturados
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
}
bootstrap();

async function listenOnAvailablePort(
  app: INestApplication,
  startPort: number,
): Promise<number> {
  const maxRetries = 20;
  for (let offset = 0; offset <= maxRetries; offset++) {
    const portToTry = startPort + offset;
    try {
      await app.listen(portToTry, '0.0.0.0');
      return portToTry;
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'EADDRINUSE') {
        console.warn(
          `Puerto ${portToTry} en uso, intentando con ${portToTry + 1}...`,
        );
        continue;
      }
      throw error;
    }
  }

  await app.listen(0, '0.0.0.0');
  const address = app.getHttpServer().address();
  if (typeof address === 'object' && address) {
    return address.port;
  }
  throw new Error('No se pudo determinar un puerto disponible');
}
