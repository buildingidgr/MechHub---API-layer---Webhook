import Fastify, { FastifyInstance } from 'fastify';
import { webhookHandler } from './handlers/webhook';
import { verifyClerkWebhook } from './middleware/clerk-verification';
import { QueueService } from './services/queue';

const server: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Register middleware
server.addHook('preHandler', verifyClerkWebhook);

// Register routes
server.post('/webhook/clerk', webhookHandler);

// Add a health check route
server.get('/', async (request, reply) => {
  return { status: 'ok' };
});

// Start the server
const start = async () => {
  try {
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

