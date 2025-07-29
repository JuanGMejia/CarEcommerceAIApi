import { Injectable } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class AzureBlobService {
  private blobServiceClient: BlobServiceClient;

  constructor() {
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

}