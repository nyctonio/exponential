import express from 'express';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { env } from 'env';

const httpServer = createServer();
const app = express();
const PORT = env.SOCKET_PORT;
const pubClient = createClient({ url: env.REDIS_URL });

const subClient = pubClient.duplicate();
const io = new Server(httpServer, {});

app.use(morgan('combined'));
io.adapter(createAdapter(pubClient, subClient));

subClient.connect().then(() => {
  console.log('connected to redis');
});

subClient.on('error', (err) => {
  console.log('Error ' + err);
});

// on adapter connection  -  on adapter connection
io.on('connection', (socket) => {
  console.log('connected to adapter');
  socket.on('load-test', (data) => {
    socket.emit('test_emit', data);
    console.log('testing', data);
  });
  socket.on('JOIN_ROOM', (data) => {
    data = JSON.parse(data);
    console.log('join room data is ', data);
    socket.join(data);
    return;
  });
  socket.on('disconnect', () => {
    socket.disconnect();
    console.log('disconnected from adapter');
  });
  socket.on('LEAVE_ROOM', async (data) => {
    data = JSON.parse(data);
    console.log('leave room data is ', data);
    await Promise.all(
      data.map(async (roomId) => {
        console.log('leaving ', roomId);
        await socket.leave(roomId);
      })
    );
    console.log('completed');
    return;
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
