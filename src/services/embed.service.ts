import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { AzureBlobService } from './azure-blob.service';
import OpenAI from 'openai';
import * as fs from 'fs';


@Injectable()
export class EmbedService implements OnModuleInit {

  qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL, // Ensure you have set this environment variable
    apiKey: process.env.QDRANT_ID, // Ensure you have set this environment variable
  });
  

  readonly COLLECTION_NAME = 'Car-Ecommerce';
  constructor(private readonly azureBlobService: AzureBlobService) {}

  async onModuleInit() {
      try {
        console.log('Iniciando proceso de embeddings al arrancar el servicio...');
        await this.embed();
        console.log('Embeddings procesados exitosamente al iniciar el servicio');
      } catch (error) {
        console.error('Error al procesar embeddings al iniciar:', error.message);
        // No lanzar el error para que el servicio pueda continuar
      }
  }

  async embed() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_ID, 
    });
    const containerName = process.env.BLOB_CONTAINER|| ''; 
    const blobName = process.env.BLOB_NAME || '';
    const fileContent = await this.azureBlobService.downloadFileAsString(containerName, blobName); 
    const chunks = this.splitTextWithOverlap(fileContent);
    const points: { id: number, vector: number[], payload: { text: string } }[] = [];
    for (const chunk of chunks) {
      const response: number[] = await this.getEmbeddings(chunk,openai);
      points.push({
        id: points.length + 1,
        vector: response,
        payload: {
          text: chunk,
        }
      })
    }
    await this.createCollectionQdrant();
    console.log('salio de Crear coleccion');
    await this.uploadToQdrant(points);
  }
  async createCollectionQdrant() {
      this.qdrantClient.deleteCollection(this.COLLECTION_NAME);
      console.log('Creando coleccion');
      await this.qdrantClient.createCollection(this.COLLECTION_NAME, {
        vectors: {
          size: 1536,
          distance: 'Dot',
        }
      });
  }
  uploadToQdrant(points: any): Promise<any> {
    console.log('Subiendo a qdrant');
    return this.qdrantClient.upsert(this.COLLECTION_NAME, { points })
  }
  async queryToVectorDB(embedding: number[]): Promise<string[]> {
      try{
      //await this.ensureCollectionExists(); 
      const result = await this.qdrantClient.search(this.COLLECTION_NAME, {
        vector: embedding,
        with_payload: true
      });
      return result.map(item => item.payload?.text as string ?? '');
    }
    catch (error) {
    throw error;
    }
  }
  
  async getEmbeddings(text: string, openai:OpenAI): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', 
      input: text
    });
    return response.data[0].embedding;
  };

  splitTextWithOverlap(
    text: string,
    chunkSize: number = 400,
    overlap: number = 60
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
