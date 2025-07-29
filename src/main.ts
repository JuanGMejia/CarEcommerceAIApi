import * as appInsights from 'applicationinsights';

let telemetryClient: appInsights.TelemetryClient | undefined;

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoCollectConsole(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true, false)
    .setAutoCollectRequests(true)
    .setSendLiveMetrics(false) 
    .start();
  telemetryClient = appInsights.defaultClient;
}

export { telemetryClient };

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://car-ecommerce-ui-bvewdmhzdng6araf.canadacentral-01.azurewebsites.net'
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
