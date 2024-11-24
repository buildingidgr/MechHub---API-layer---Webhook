import { FastifyRequest, FastifyReply } from 'fastify';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

export async function verifyClerkWebhook(request: FastifyRequest, reply: FastifyReply) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  const payload = JSON.stringify(request.body);
  const headers = request.headers;

  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(payload, headers as Record<string, string>) as WebhookEvent;
    request.body = evt;
  } catch (err) {
    return reply.code(400).send('Invalid webhook');
  }
}

