import { io } from 'socket.io-client';
const socketURL = `${process.env.NEXT_PUBLIC_SOCKET_URL}`;

const initSocket: any = () => {
  const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
  };
  return io(socketURL, options);
};

export default initSocket;
