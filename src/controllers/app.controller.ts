import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { AzureADGuard } from 'src/services/jwt.service';
import { EmbedService } from 'src/services/embed.service';
import { ChatService } from 'src/services/chat.service';
import { from, map, Observable } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly embedService: EmbedService,
    private readonly chatService: ChatService
  ) { }

  @Get('health')
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('chat')
  @UseGuards(AzureADGuard)
  protected(@Body() info: { message: string }): Observable<{ message: string }> {
    console.log('Protected route accessed with message:', info.message);
    return from(this.chatService.sendMessageToAgent(info.message)).pipe(
      map(response => ({ message: response })));
  }
  @Get('embed')
  @UseGuards(AzureADGuard)
  async embed(): Promise<{ message: string }> {
    await this.embedService.embed();
    return { message: 'Embedded completed' };
  }
}
