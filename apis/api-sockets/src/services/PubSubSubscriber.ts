import { PubSub, Subscription, Topic, Message } from '@google-cloud/pubsub';
import { randomUUID } from 'crypto';
import config from '@/config';
import { WebSocketHandler } from '@/services/WebSocketHandler';

export interface SocketPubSubMessage {
  event: string;
  emails: string[];
  payload: unknown;
  source: string;
  publishedAt: string;
}

/**
 * Each api-sockets pod creates its OWN subscription on the shared topic at
 * boot. PubSub fans every message to every subscription, so every pod
 * receives every event and can emit it to its locally-connected clients.
 *
 * A shared subscription name across pods would load-balance messages
 * between pods (competing consumers), so a client connected to pod B would
 * silently miss any event that landed on pod A. That defeats the whole
 * purpose of the fan-out and is why this mirrors the per-pod ephemeral
 * subscription pattern from api-mono's PodBroadcastService.
 *
 * Dead pods leak subscriptions; we set an `expirationPolicy` so GCP
 * auto-deletes any subscription that hasn't been pulled in N seconds, and
 * also explicitly delete on graceful shutdown.
 */
class PubSubSubscriber {
  private pubsub: PubSub | null = null;
  private topic: Topic | null = null;
  private subscription: Subscription | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized || !config.socketPubSub.enabled) {
      return;
    }

    const pubSubOptions: { projectId?: string; apiEndpoint?: string } = {};
    if (config.socketPubSub.projectId) {
      pubSubOptions.projectId = config.socketPubSub.projectId;
    }
    if (config.socketPubSub.emulatorHost) {
      pubSubOptions.apiEndpoint = config.socketPubSub.emulatorHost;
    }

    this.pubsub = new PubSub(pubSubOptions);
    this.topic = this.pubsub.topic(config.socketPubSub.topicName);

    if (config.socketPubSub.createTopicIfMissing) {
      const [exists] = await this.topic.exists();
      if (!exists) {
        await this.pubsub.createTopic(config.socketPubSub.topicName);
        console.log(`[PubSubSubscriber] Created topic: ${config.socketPubSub.topicName}`);
      }
    }

    const subscriptionName = `${config.socketPubSub.topicName}-${randomUUID()}`;
    const [subscription] = await this.topic.createSubscription(subscriptionName, {
      expirationPolicy: {
        ttl: { seconds: config.socketPubSub.subscriptionExpirationSeconds },
      },
      ackDeadlineSeconds: 10,
    });
    this.subscription = subscription;

    subscription.on('message', (message) => this.handleMessage(message));
    subscription.on('error', (error: Error) => {
      console.error('[PubSubSubscriber] Subscription error:', error);
    });

    this.isInitialized = true;
    console.log(`[PubSubSubscriber] Subscribed as: ${subscriptionName}`);
  }

  private handleMessage(message: Message): void {
    try {
      const data = JSON.parse(message.data.toString()) as SocketPubSubMessage;

      if (typeof data.event !== 'string') {
        console.error('[PubSubSubscriber] Invalid message payload: missing event', {
          messageId: message.id,
        });
        message.ack();
        return;
      }

      if (!Array.isArray(data.emails) || data.emails.length === 0) {
        console.error('[PubSubSubscriber] Invalid message payload: missing emails', {
          messageId: message.id,
        });
        message.ack();
        return;
      }

      // Emit to each user's room (keyed by email). io.to(room).emit is a
      // no-op locally if the client isn't connected to this pod — that's
      // fine because every pod receives every message via its own
      // subscription, so the pod the client IS on will emit it.
      for (const email of data.emails) {
        WebSocketHandler.emitToUser(email, data.event, data.payload);
      }

      message.ack();
    } catch (error) {
      console.error('[PubSubSubscriber] Error processing message:', error);
      message.ack();
    }
  }

  async close(): Promise<void> {
    if (!this.subscription) {
      return;
    }
    const sub = this.subscription;
    this.subscription = null;
    this.isInitialized = false;
    try {
      await sub.close();
    } catch (error) {
      console.error('[PubSubSubscriber] close failed', error);
    }
    try {
      await sub.delete();
    } catch (error) {
      // expirationPolicy will clean it up eventually
      console.warn('[PubSubSubscriber] delete failed (will expire)', error);
    }
  }
}

export default new PubSubSubscriber();
