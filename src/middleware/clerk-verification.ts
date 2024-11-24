import { FastifyRequest, FastifyReply } from 'fastify';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

export function verifyClerkWebhook(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('CLERK_WEBHOOK_SECRET is not set. Webhook verification is disabled.');
    done();
    return;
  }

  const payload = JSON.stringify(request.body);
  const headers = request.headers;

  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(payload, headers as Record<string, string>) as WebhookEvent;
    request.body = evt;
    done();
  } catch (err) {
    done(new Error('Invalid webhook'));
  }
}

