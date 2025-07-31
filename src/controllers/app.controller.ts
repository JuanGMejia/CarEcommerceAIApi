import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { AzureADGuard } from 'src/services/jwt.service';
import { EmbedService } from 'src/services/embed.service';
import { ChatService } from 'src/services/chat.service';
import { from, map, Observable } from 'rxjs';
import { AzureBlobService, Conversation } from 'src/services/azure-blob.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly embedService: EmbedService,
    private readonly chatService: ChatService,
    private readonly azureBlobService: AzureBlobService
  ) { }

  @Get('health')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('chat')
  @UseGuards(AzureADGuard)
  protected(@Body() info: { message: string }): Observable<{ message: string }> {
    return from(this.chatService.sendMessageToAgent(info.message)).pipe(
      map(response => ({ message: response })));
  }

  @Get('conversations')
  @UseGuards(AzureADGuard)
  getConversations(): Observable<Conversation[]> {
    return from(this.azureBlobService.getConversation())
  }

  @Get('embed')
  @UseGuards(AzureADGuard)
  async embed(): Promise<{ message: string }> {
    await this.embedService.embed();
    return { message: 'Embedded completed' };
  }
}
