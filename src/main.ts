import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); //TODO: remove this in production
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('API Pmscan')
    .setDescription("Documentation de l'API Pmscan")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/apidoc', app, document);
  await app.listen(process.env.PORT);
}
bootstrap();
//TODO: add global validation pipe helmet and security
