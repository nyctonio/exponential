import mongoose from 'mongoose';
import { env } from 'env';

// mongoose.connect('mongodb://127.0.0.1:27017/suspicious_trade', {
//   bufferCommands: false,
// });

// let db = mongoose.connection;

// db.on('error', (e) => {
//   console.log('error connecting to database', e);
// });

// db.once('open', () => {
//   console.log('connected to mongodb ', env.MONGO);
// });

export const connectToDatabaseLogger = async () => {
  try {
    mongoose.connect(env.MONGO, {});

    const db = mongoose.connection;

    db.on('error', (e) => {
      console.error('Error connecting to database', e);
    });

    db.once('open', () => {
      console.log('Connected to Logger MongoDB ');
    });
  } catch (error) {
    console.error('Error connecting to database', error);
    throw error;
  }
};
