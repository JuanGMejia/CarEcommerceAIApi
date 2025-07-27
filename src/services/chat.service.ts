import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EmbedService } from './embed.service';
// import axios from 'axios';

@Injectable()
export class ChatService {

  openai = new OpenAI({
    apiKey: process.env.OPENAI_ID, // Ensure you have set this environment variable
  });

  constructor(private readonly embedService: EmbedService) { }

  async sendMessageToAgent(message: string): Promise<string> {
    const response: number[] = await this.embedService.getEmbeddings(message);
    const responseEmbedding = await this.embedService.queryToVectorDB(response);
    return this.getChatResponse(message, responseEmbedding.join(' '));
  }

  async getChatResponse(question: string, context: string): Promise<string> {
    // For Local Testing
    // const response = await axios.post(
    //   'http://127.0.0.1:1234/v1/chat/completions',
    //   {
    //     "model": "google/gemma-3-12b",
    //     "messages": [
    //       { "role": "system", "content": `This is the context you need to answer the question of the user ${context}, be concise and polite with the answer, if you don't find any information about the question here, tell the user this chat will solve only questions about our Car E-commerce company` },
    //       { "role": "user", "content": question }
    //     ],
    //     "temperature": 0.1,
    //   }
    // );
    // return response.data.choices[0].message.content;

    const response = await this.openai.chat.completions.create({
      model: 'o3-mini',
      "messages": [
        { "role": "system", "content": `This is the context you need to answer the question of the user ${context}, be concise and polite with the answer, if you don't find any information about the question here, tell the user this chat will solve only questions about our Car E-commerce company` },
        { "role": "user", "content": question }
      ],
    });
    return response.choices[0].message.content ?? 'No response from agent';
  }

}
