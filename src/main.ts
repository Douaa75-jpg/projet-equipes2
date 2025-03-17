import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core'; 
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule , { logger: ['error', 'warn', 'debug', 'log'] });
  
  app.enableCors();
   // Utilisation globale du guard pour toutes les routes
   app.useGlobalGuards();

   // Validation des données d'entrée via ValidationPipe
   app.useGlobalPipes(new ValidationPipe());

   
  const config = new DocumentBuilder()
  .setTitle('Mon API')
  .setDescription('Documentation de l\'API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();