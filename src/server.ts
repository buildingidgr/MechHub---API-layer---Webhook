import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { webhookHandler } from './handlers/webhook';
import { verifyClerkWebhook } from './middleware/clerk-verification';
import { QueueService } from './services/queue';
import { DatabaseService } from './services/database';
import { CacheService } from './services/cache';

const serverOptions: FastifyServerOptions = {
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
      err: (err: any) => {
        return {
          type: err.type || 'UNKNOWN',
          message: err.message,
          stack: err.stack || 'No stack trace available'
        };
      }
    }
  }
};

const server: FastifyInstance = Fastify(serverOptions);

// Register middleware
server.addHook('preHandler', verifyClerkWebhook);

// Register routes
server.post('/webhook/clerk', webhookHandler);

// Add a health check route
server.get('/', async (request, reply) => {
  try {
    await DatabaseService.ping();
    await CacheService.ping();
    return { status: 'ok' };
  } catch (error) {
    server.log.error(error);
    return reply.status(500).send({ error: 'Health check failed' });
  }
});

// Start the server
const start = async () => {
  try {
    await DatabaseService.connect();
    await CacheService.connect();
    await QueueService.init();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

