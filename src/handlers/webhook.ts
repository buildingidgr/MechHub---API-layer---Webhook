import { FastifyRequest, FastifyReply } from 'fastify';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { QueueService } from '../services/queue';

export async function webhookHandler(
  request: FastifyRequest<{ Body: WebhookEvent }>,
  reply: FastifyReply
) {
  try {
    const event = request.body;
    
    if (event.type !== 'user.created') {
      reply.status(200).send();
      return;
    }

    await QueueService.add('process-new-user', {
      userId: event.data.id,
      email: event.data.email_addresses[0]?.email_address || '',
      timestamp: event.data.created_at  // This is now a number
    });

    reply.status(202).send({ status: 'processing' });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

