import Bull from 'bull';
import { KeyGenerator } from '../utils/key-generator';
import { DatabaseService } from './database';
import { CacheService } from './cache';

interface WebhookPayload {
  userId: string;
  email: string;
  timestamp: string;
}

export class QueueService {
  private static queue: Bull.Queue<WebhookPayload>;

  static async init() {
    this.queue = new Bull<WebhookPayload>('user-processing', process.env.REDIS_URL || '');

    this.queue.process('process-new-user', async (job) => {
      const { userId, email, timestamp } = job.data;
      
      const apiKey = await KeyGenerator.generate(userId);
      
      await DatabaseService.storeApiKey({
        userId,
        email,
        apiKey,
        createdAt: timestamp
      });
      
      await CacheService.setApiKey(userId, apiKey);
      
      return { success: true, userId, apiKey };
    });
  }

  static async add(type: string, data: WebhookPayload) {
    return this.queue.add(type, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    });
  }
}

