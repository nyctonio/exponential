import amqplib, { Channel, Connection } from 'amqplib';
import { env } from 'env';
function Logger() {
  return {
    info: (message: string) => console.log(message),
    error: (message: string) => console.log(message),
  };
}

class RabbitMQ {
  connection: Connection;
  channel: Channel;
  logger = Logger();

  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqplib.connect(env.QUEUE_HOST);
      this.channel = await this.connection.createChannel();
      this.logger.info('connected to rabbitmq');
    } catch (error) {
      this.logger.error('error');
    }
  }

  async publish(queue: string, message: string) {
    try {
      await this.channel.assertQueue(queue);
      await this.channel.sendToQueue(queue, Buffer.from(message));
      this.logger.info(`Message published to ${queue}`);
    } catch (error) {
      console.log('error is ', error);
      this.logger.error(`Message publishing failed to ${queue}`);
    }
  }

  async consume(queue: string, callback: (message: any) => Promise<void>) {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      // safe limit so that if the consumer is not able to process the message then the queue will go down
      await this.channel.prefetch(20);
      this.channel.consume(
        queue,
        async (message) => {
          // console.log('message =====> ');
          let messageBody = JSON.parse(message.content.toString());
          await callback(messageBody);
          this.channel.ack(message);
        },
        {
          noAck: false,
        }
      );
      this.logger.info(`Message consumed from ${queue}`);
    } catch (error) {
      this.logger.error(`Message consuming failed from ${queue}`);
      this.logger.error(error);
    }
  }

  async close() {
    try {
      await this.channel.close();
      await this.connection.close();
      this.logger.info('RabbitMQ closed');
    } catch (error) {
      this.logger.error('RabbitMQ closing failed');
      this.logger.error(error);
    }
  }
}

export default RabbitMQ;
