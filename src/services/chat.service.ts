import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EmbedService } from './embed.service';
import { AppInsightsService } from './app-insights.service';

@Injectable()
export class ChatService {

  openai = new OpenAI({
    apiKey: process.env.OPENAI_ID,
  });
  
  constructor(
    private readonly embedService: EmbedService,
    private readonly appInsightsService: AppInsightsService
  ) { }

  async sendMessageToAgent(message: string): Promise<string> {
  try {
    console.log('*** Message received at:', Date().toString());
    await this.performLogging("ChatMessageSent", message, false);
    const response: number[] = await this.embedService.getEmbeddings(message, this.openai);
    const responseEmbedding = await this.embedService.queryToVectorDB(response);
    return await this.getChatResponse(message, responseEmbedding.join(' '));
    }
    catch (error) {
      await this.performLogging(error.exception?.toString() || error.message, error.message + " - " + error.stack, true);
      return  `⚠️ Lamentamos mucho las molestias 🙏
                En este momento estamos experimentando dificultades para conectarnos al sistema y no podemos acceder a la información solicitada.
                Estamos trabajando para resolverlo lo antes posible 🛠️
                Agradecemos tu comprensión y paciencia. Si lo deseas, puedes dejarnos tus datos de contacto y te avisaremos tan pronto esté disponible.
                Gracias por confiar en nosotros. Estamos aquí para ayudarte`;
      //throw error; 
    }
    finally {
      console.log('*** Message processed at:', Date().toString());
      await this.performLogging("ChatMessageProcessed", message, false);
    }
  }

  async getChatResponse(question: string, context: string): Promise<string> {
    //console.log('Question:', question);
    //console.log('Context:', context);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      "messages": [
        {
          "role": "system", "content": `You are a helpful, knowledgeable assistant representing a car e-commerce company.
                                          Use the following context to answer the user's question: ${context}.
                                          Be clear, concise, and professional.
                                          If the user's question is not related to our car e-commerce services, politely respond that this chat is intended only for questions about our car platform.
                                          Always respond in the same language the user uses.
                                          Maintain a friendly tone prioritize clarity and build trust as an expert in car sales and services.
                                          If you are replying with a list please use number 1, 2, 3, etc. to list the items, ensure you are giving a list, use emojis to make it more attractive.
                                          Before you answer the question, please check if the question is related to the context, if not, politely respond that this chat is intended only for questions about our car platform.
                                          Format the response using Markdown, with bold model names as section headers, and present features as bullet points. Use a friendly and professional tone, suitable for a customer-facing message.` },
        { "role": "user", "content": question }
      ],
    });
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content ?? 'No response from agent';
  }

  async performLogging(tagName: string, message: string,  isError: boolean): Promise<void> {
    await this.appInsightsService.performLogging(message, tagName, isError);
  }
}
