import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { JwtStrategy } from './services/jwt.service';
import { PassportModule } from '@nestjs/passport';
import { EmbedService } from './services/embed.service';
import { ChatService } from './services/chat.service';
import { ConfigModule } from '@nestjs/config';
import { AzureBlobService } from './services/azure-blob.service';
import { AppInsightsService } from './services/app-insights.service';
import { CacheService } from './services/cache.service';
import { CacheModule } from '@nestjs/cache-manager';



@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600 * 1000, 
      max: 100, 
    }),

  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, EmbedService, ChatService, AzureBlobService, AppInsightsService,CacheService],
  exports: [CacheService],
})
export class AppModule { }
