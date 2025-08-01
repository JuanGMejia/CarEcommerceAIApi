import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cache.get<T>(key);
      if (value !== undefined && value !== null) {
        return value;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      // TTL por defecto: 1 hora en milisegundos
      const ttlMs = ttl ? ttl * 1000 : 3600 * 1000;
      await this.cache.set(key, value, ttlMs);
    } catch (error) {
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await this.cache.get(key);
      return value !== undefined && value !== null;
    } catch (error) {
      return false;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (error) {
    }
  }
}