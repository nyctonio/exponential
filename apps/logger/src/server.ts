// import express from 'express';
// import morgan from 'morgan';
import logPublisher from './lib/log-publisher';
import { env } from 'env';
import express from 'express';
import amqp from 'amqplib';
// import { connectToDatabase } from '../../../packages/database/mongodb';
import { connectToDatabaseLogger } from './db/index';

const app = express();
const port = 4055;

app.listen(port, async () => {
  console.log('Log Server running at port', port);
  connectToDatabaseLogger();

  const connection = await amqp.connect(env.QUEUE_HOST);
  const channel = await connection.createChannel();

  const queueName = 'logsqueue';

  await channel.assertQueue(queueName, { durable: true });

  const logSaver = (msg: amqp.ConsumeMessage | null) => {
    if (msg) {
      console.log(`Received message: ${msg.content.toString()}`);
      // Add your logic to handle the message as needed
      logPublisher(msg.content.toString());
    }
  };
  await channel.consume(queueName, logSaver, { noAck: true });
});
