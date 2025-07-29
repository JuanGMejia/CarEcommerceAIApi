import * as appInsights from 'applicationinsights';

// Inicializa Application Insights primero
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoCollectConsole(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true, false)
    .setAutoCollectRequests(true)
    .setSendLiveMetrics(true)
    .start();
}

// Luego importa el resto
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200'], // ✅ allow your frontend origin
    credentials: true, // ✅ allow cookies and Authorization headers
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
