import { randomBytes } from 'crypto';

export class KeyGenerator {
  static async generate(userId: string): Promise<string> {
    const prefix = 'mk';  // MechHub Key prefix
    const random = randomBytes(16).toString('hex');
    const timestamp = Date.now().toString(36);
    
    return `${prefix}_${userId}_${random}_${timestamp}`;
  }
}

