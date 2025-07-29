import * as appInsights from 'applicationinsights';

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoCollectConsole(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true, false)
    .setAutoCollectRequests(true)
    .setSendLiveMetrics(true)
    .start();
}
export const telemetryClient = appInsights.defaultClient;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200', 'https://car-ecommerce-ui-bvewdmhzdng6araf.canadacentral-01.azurewebsites.net'], // ✅ allow your frontend origin
    credentials: true, // ✅ allow cookies and Authorization headers
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
