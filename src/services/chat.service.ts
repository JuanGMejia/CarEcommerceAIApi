import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EmbedService } from './embed.service';
import { telemetryClient } from '../main'; 

@Injectable()
export class ChatService {

  openai = new OpenAI({
    apiKey: process.env.OPENAI_ID,
  });
  constructor(private readonly embedService: EmbedService) { }

  async sendMessageToAgent(message: string): Promise<string> {
  try {
    console.log('*** Message received at:', Date().toString());
    telemetryClient.trackEvent({ name: "ChatMessageSent", properties: { message } });
    const response: number[] = await this.embedService.getEmbeddings(message,this.openai);
    //console.log("embeding response", response)
    const responseEmbedding = await this.embedService.queryToVectorDB(response);
      return await this.getChatResponse(message, responseEmbedding.join(' '));
    } 
    catch (error) {
      telemetryClient.trackException({exception: error, properties: { message } });
      throw error; 
    }
    finally {
      console.log('*** Message processed at:', Date().toString());
      telemetryClient.trackEvent({ name: "ChatMessageProcessed", properties: { message } });
    }
  }

  async getChatResponse(question: string, context: string): Promise<string> {
    //console.log('Question:', question);
    //console.log('Context:', context);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      "messages": [
        { "role": "system", "content": `You are a helpful, knowledgeable assistant representing a car e-commerce company.
                                          Use the following context to answer the user's question: ${context}.
                                          Be clear, concise, and professional.
                                          If the user's question is not related to our car e-commerce services, politely respond that this chat is intended only for questions about our car platform.
                                          Always respond in the same language the user uses.
                                          Maintain a friendly tone prioritize clarity and build trust as an expert in car sales and services.` },
        { "role": "user", "content": question }
      ],
    });
    console.log('Leaving getChatResponse:', Date().toString());
    return response.choices[0].message.content ?? 'No response from agent';
  }

}
