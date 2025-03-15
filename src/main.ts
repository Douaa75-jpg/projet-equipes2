import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core'; 
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule , { logger: ['error', 'warn', 'debug', 'log'] });
  
  app.enableCors();

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