import { Injectable } from '@nestjs/common';
import { textToEmbed } from './info.embed';
import { QdrantClient } from '@qdrant/js-client-rest';
import axios from 'axios';
@Injectable()
export class EmbedService {

  qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL, // Ensure you have set this environment variable
    apiKey: process.env.QDRANT_ID, // Ensure you have set this environment variable
  });

  readonly COLLECTION_NAME = 'Car-Ecommerce';

  async queryToVectorDB(embedding: number[]): Promise<string[]> {
    const result = await this.qdrantClient.search(this.COLLECTION_NAME, {
      vector: embedding,
      with_payload: true
    });

    return result.map(item => item.payload?.text as string ?? '');
  }

  async embed() {
    const chunks = this.splitTextWithOverlap(textToEmbed);
    const points: { id: number, vector: number[], payload: { text: string } }[] = [];
    for (const chunk of chunks) {
      const response: number[] = await this.getEmbeddings(chunk);
      points.push({
        id: points.length + 1,
        vector: response,
        payload: {
          text: chunk,
        }
      })
    }
    await this.qdrantClient.createCollection(this.COLLECTION_NAME, {
      vectors: {
        size: 768,
        distance: 'Dot',
      }
    })
    await this.uploadToQdrant(points);
  }


  uploadToQdrant(points: any): Promise<any> {
    return this.qdrantClient.upsert(this.COLLECTION_NAME, { points })
  }

  async getEmbeddings(text: string): Promise<number[]> {
    // To embed locally, we need to review to use the embedding from OpenAI
    const response = await axios.post(
      'http://127.0.0.1:1234/v1/embeddings',
      {
        input: text,
        model: 'text-embedding-nomic-embed-text-v1.5:2' // e.g. 'text-embedding-ada-002' or your custom model
      },
    );
    return response.data?.data?.[0]?.embedding as number[] || [];
  };

  splitTextWithOverlap(
    text: string,
    chunkSize: number = 500,
    overlap: number = 50
  ): string[] {
    const chunks: string[] = [];

    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push(chunk);

      if (end === text.length) break;
      start += chunkSize - overlap;
    }

    return chunks;
  }
}
