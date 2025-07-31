import { Injectable } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { JwtStrategy } from './jwt.service';
export type Conversation = {
  role: string;
  content: string;
};
@Injectable()
export class AzureBlobService {
  private blobServiceClient: BlobServiceClient;
  readonly CONVERSATION_CONTAINER = 'conversation';
  constructor(
    private jwt: JwtStrategy
  ) {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error('AZURE_STORAGE_CONNECTION environment variable is not set');
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  }

  async downloadFileAsString(containerName: string, blobName: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download();
    const stream = downloadBlockBlobResponse.readableStreamBody;
    if (!stream) {
      throw new Error('No readable stream returned from blob download.');
    }
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks).toString('utf-8');
  }

  async uploadConversation(
    content: Conversation[],
  ): Promise<void> {
    const fileName = this.jwt.userInfo.oid;
    const containerFile = this.blobServiceClient.getContainerClient(this.CONVERSATION_CONTAINER);

    // Ensure the container exists
    await containerFile.createIfNotExists();

    const blockBlobClient = containerFile.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(
      Buffer.from(JSON.stringify(content)),
    );
  }

  async getConversation(): Promise<Conversation[]> {
    const containerFile = this.blobServiceClient.getContainerClient(this.CONVERSATION_CONTAINER);
    const conversationExist: boolean = await containerFile.getBlobClient(this.jwt.userInfo.oid).exists();
    if (conversationExist) {
      const fileName = this.jwt.userInfo.oid;
      const content: string = await this.downloadFileAsString(this.CONVERSATION_CONTAINER, fileName);
      return Promise.resolve(JSON.parse(content) as Conversation[]);
    }
    return Promise.resolve([]);
  }

}