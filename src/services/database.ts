import { MongoClient } from 'mongodb';

export class DatabaseService {
  private static client: MongoClient;
  private static db: any;

  static async connect() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
      this.client = await MongoClient.connect(mongoUri);
      this.db = this.client.db('mechhub');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  static async ping() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    await this.db.command({ ping: 1 });
  }

  static async storeApiKey({ userId, email, apiKey, createdAt }: {
    userId: string;
    email: string;
    apiKey: string;
    createdAt: Date;
  }) {
    if (!this.db) await this.connect();
    
    return this.db.collection('api_keys').insertOne({
      userId,
      email,
      apiKey,
      createdAt
    });
  }
}

