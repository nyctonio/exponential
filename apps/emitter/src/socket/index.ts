import { Server } from 'socket.io';
import { createServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { env } from 'env';

const httpServer = createServer();
const io = new Server(httpServer, {});
const pubClient = createClient({ url: env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

export { io, pubClient, httpServer };
