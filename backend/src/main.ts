import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration - environment aware
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
      : true, // Allow all origins in development
    credentials: true,
  };
  app.enableCors(corsOptions);

  const port = process.env.PORT || 3001;
  // Listen on 0.0.0.0 to allow connections from network devices (mobile)
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Network access: http://192.168.1.220:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
