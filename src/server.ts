import Fastify from 'fastify';
import { webhookHandler } from './handlers/webhook';
import { verifyClerkWebhook } from './middleware/clerk-verification';
import { QueueService } from './services/queue';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Register middleware
server.addHook('preHandler', verifyClerkWebhook);

// Register routes
server.post('/webhook/clerk', webhookHandler);

// Start the server
const start = async () => {
  try {
    await QueueService.init();
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

