import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EmbedService } from './embed.service';
import { AppInsightsService } from './app-insights.service';
import { AzureBlobService } from './azure-blob.service';
import { CacheService } from './cache.service';
import { JwtStrategy } from './jwt.service';


@Injectable()
export class ChatService {

  openai = new OpenAI({
    apiKey: process.env.OPENAI_ID,
  });

  constructor(
    private readonly embedService: EmbedService,
    private readonly appInsightsService: AppInsightsService,
    private readonly azureBlobService: AzureBlobService,
    private readonly cacheService: CacheService,
    private readonly jwt: JwtStrategy
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
      return `⚠️ Lamentamos mucho las molestias 🙏
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
    const allMessages: any = await this.azureBlobService.getConversation();
    console.log("Nombre de usuario", this.jwt.userInfo.name.split(' '));
    const prompt=await this.getprompt() 
                + "Important!: always use user's name:"+ this.jwt.userInfo.name.split(' ')+" to answer the question more personally and be formal with the name."
                + "Context: " + context;
                
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...allMessages,
        {
          role: 'system',
          content: `Instructions: ${prompt}`
        },
        { role: "user", content: question }
      ],
    });
    const responseText: string = response.choices[0].message.content ?? 'No response from agent';
    const newConversation = [
      { role: "user", content: question },
      { role: "system", content: responseText }
    ]
    await this.azureBlobService.uploadConversation([...allMessages, ...newConversation])
    return responseText;
  }
  async getprompt()
  {
    const containerName = process.env.BLOB_CONTAINER|| ''; 
    
    let prompt=await this.cacheService.get("PromptFile");
    if(!prompt)
    {
      prompt=await this.azureBlobService.downloadFileAsString(containerName,"Prompt.txt");
      await this.cacheService.set("PromptFile",prompt);
    }
    return prompt;
  }
  async performLogging(tagName: string, message: string, isError: boolean): Promise<void> {
    await this.appInsightsService.performLogging(message, tagName, isError);
  }
}
