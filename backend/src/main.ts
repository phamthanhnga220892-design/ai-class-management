import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration - environment aware
  const allowedOrigins = [
    'https://ai-class-management-psi.vercel.app', // Production Vercel
    'http://localhost:3000', // Local development
    'http://192.168.1.220:3000', // Mobile testing
  ];

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // In production, check against allowed origins
      if (process.env.NODE_ENV === 'production') {
        // Allow custom FRONTEND_URL if set
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
          return callback(null, true);
        }
        // Allow Vercel deployments (*.vercel.app)
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }

      // In development, allow all
      callback(null, true);
    },
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
