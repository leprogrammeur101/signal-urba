import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateStartupConfig } from './common/startup.validator';

async function bootstrap() {
  // Validation des variables d'environnement au démarrage
  validateStartupConfig();

  const app = await NestFactory.create(AppModule);

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
    }),
  );

  // CORS dynamique depuis les variables d'environnement
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:19006'];

  app.enableCors({
    origin:      corsOrigins,
    credentials: true,
  });

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle("Signal'Urba API")
    .setDescription('API REST de la plateforme de signalement urbain citoyen')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth')
    .addTag('Users')
    .addTag('Reports')
    .addTag('Categories')
    .addTag('Uploads')
    .addTag('Notifications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API démarrée sur http://localhost:${port}`);
  console.log(`📚 Swagger : http://localhost:${port}/api/docs`);
}
bootstrap();
