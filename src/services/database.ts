import { MongoClient } from 'mongodb';

export class DatabaseService {
  private static client: MongoClient;
  private static db: any;

  static async connect() {
    this.client = await MongoClient.connect(process.env.MONGODB_URI as string);
    this.db = this.client.db('mechhub');
  }

  static async storeApiKey({ userId, email, apiKey, createdAt }: {
    userId: string;
    email: string;
    apiKey: string;
    createdAt: Date;  // Changed from string to Date
  }) {
    if (!this.db) await this.connect();
    
    return this.db.collection('api_keys').insertOne({
      userId,
      email,
      apiKey,
      createdAt  // This is now a Date object
    });
  }
}

