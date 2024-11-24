import Bull from 'bull';
import { KeyGenerator } from '../utils/key-generator';
import { DatabaseService } from './database';
import { CacheService } from './cache';

interface NewUserJobData {
  userId: string;
  email: string;
  timestamp: number;
}

export class QueueService {
  private static queue: Bull.Queue<NewUserJobData>;

  static async init() {
    try {
      this.queue = new Bull<NewUserJobData>('user-processing', process.env.REDIS_URL || '');
      console.log('Connected to Bull queue');

      this.queue.process('process-new-user', async (job) => {
        const { userId, email, timestamp } = job.data;
        
        const apiKey = await KeyGenerator.generate(userId);
        
        await DatabaseService.storeApiKey({
          userId,
          email,
          apiKey,
          createdAt: new Date(timestamp)
        });
        
        await CacheService.setApiKey(userId, apiKey);
        
        return { success: true, userId, apiKey };
      });
    } catch (error) {
      console.error('Failed to initialize Bull queue:', error);
      throw error;
    }
  }

  static async add(type: string, data: NewUserJobData) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }
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

