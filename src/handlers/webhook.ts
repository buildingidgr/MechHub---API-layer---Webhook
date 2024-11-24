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
      return reply.status(200).send();
    }

    await QueueService.add('process-new-user', {
      userId: event.data.id,
      email: event.data.email_addresses[0]?.email_address,
      timestamp: event.data.created_at
    });

    return reply.status(202).send({ status: 'processing' });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
}

