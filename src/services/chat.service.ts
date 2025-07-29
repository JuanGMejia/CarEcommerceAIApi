import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EmbedService } from './embed.service';
import * as appInsights from 'applicationinsights';



@Injectable()
export class ChatService {

  openai = new OpenAI({
    apiKey: process.env.OPENAI_ID, 
  });

  constructor(private readonly embedService: EmbedService) { }

  async sendMessageToAgent(message: string): Promise<string> {
  try {
      appInsights.defaultClient.trackEvent({ name: "ChatMessageSent", properties: { message } });
      
      const response: number[] = await this.embedService.getEmbeddings(message);
      const responseEmbedding = await this.embedService.queryToVectorDB(response);
      return await this.getChatResponse(message, responseEmbedding.join(' '));
    } catch (error) {
      appInsights.defaultClient.trackException({exception: error, properties: { message } });
      throw error; 
    }
  }

  async getChatResponse(question: string, context: string): Promise<string> {

    const response = await this.openai.chat.completions.create({
      model: 'o3-mini',
      "messages": [
        { "role": "system", "content": `This is the context you need to answer the question of the user ${context}, be concise and polite with the answer, 
                                        if you don't find any information about the question here, tell the user this chat will solve only questions about our Car E-commerce company` },
        { "role": "user", "content": question }
      ],
    });
    return response.choices[0].message.content ?? 'No response from agent';
  }

}
