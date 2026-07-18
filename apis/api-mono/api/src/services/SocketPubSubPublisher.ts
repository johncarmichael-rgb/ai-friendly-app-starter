import { PubSub, Topic } from '@google-cloud/pubsub';
import config from '@/config';

export interface SocketPubSubPublishInput {
  event: string;
  emails: string[];
  payload: unknown;
}

interface SocketPubSubEnvelope extends SocketPubSubPublishInput {
  source: 'api-mono';
  publishedAt: string;
}

class SocketPubSubPublisher {
  private pubsub: PubSub | null = null;
  private topic: Topic | null = null;
  private isInitialized = false;

  private async init(): Promise<void> {
    if (this.isInitialized) {
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
      }
    }

    this.isInitialized = true;
  }

  async publish(input: SocketPubSubPublishInput): Promise<void> {
    if (!config.socketPubSub.enabled) {
      return;
    }

    try {
      await this.init();
    } catch (error) {
      console.error('[SocketPubSubPublisher] Failed to initialize PubSub publisher', {
        topicName: config.socketPubSub.topicName,
        error,
      });
      return;
    }

    if (!this.topic) {
      console.error('[SocketPubSubPublisher] PubSub topic is unavailable, skipping publish', {
        topicName: config.socketPubSub.topicName,
        event: input.event,
        emailsCount: input.emails.length,
      });
      return;
    }

    const envelope: SocketPubSubEnvelope = {
      ...input,
      source: 'api-mono',
      publishedAt: new Date().toISOString(),
    };

    const data = Buffer.from(JSON.stringify(envelope));
    try {
      await this.topic.publishMessage({ data });
    } catch (error) {
      console.error('[SocketPubSubPublisher] Failed to publish PubSub message', {
        topicName: config.socketPubSub.topicName,
        event: input.event,
        emailsCount: input.emails.length,
        error,
      });
    }
  }
}

export default new SocketPubSubPublisher();
