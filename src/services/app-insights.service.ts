import { Injectable, OnModuleInit } from '@nestjs/common';
import * as appInsights from 'applicationinsights';

@Injectable()
export class AppInsightsService implements OnModuleInit {
  private telemetryClient: appInsights.TelemetryClient | undefined;

  async onModuleInit() {
    // Inicializar Application Insights después de que el módulo esté listo
    if (process.env.APPINSIGHTS_CONNECTION_STRING) {
      try {
        appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
          .setAutoCollectConsole(true, true)
          .setAutoCollectExceptions(true)
          .setAutoCollectPerformance(true, false)
          .setAutoCollectRequests(true)
          .setSendLiveMetrics(false) 
          .start();
        this.telemetryClient = appInsights.defaultClient;
        console.log('Application Insights initialized successfully');
      } catch (error) {
        console.warn('Application Insights setup failed:', error.message);
      }
    }
  }

  getTelemetryClient(): appInsights.TelemetryClient | undefined {
    return this.telemetryClient;
  }

  async performLogging(message: string, tagName: string, isError: boolean): Promise<void> {
    const logLabel = isError ? 'Error' : 'Log';
    
    if (this.telemetryClient) {
      if (isError) {
        this.telemetryClient.trackException({ 
          exception: new Error(tagName), 
          properties: { message } 
        });
      } else {
        this.telemetryClient.trackEvent({ 
          name: tagName, 
          properties: { message } 
        });
      }
    }
    
    console.log('***', logLabel, tagName, message);
  }
} 