import express from 'express';
import morgan from 'morgan';
import { env } from 'env';
import { AppDataSource } from 'database/sql';
import { connectToDatabase } from 'database/mongodb';
import cors from 'cors';
import { queue } from './lib/queue';
// import AuthService from './services/auth';
const app = express();
const PORT = env.API_PORT;
// import Ledger from 'entity/ledger';

app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

app.use('/api', require('./routes/routes'));

app.listen(PORT, async () => {
  await AppDataSource.initialize();
  await queue.connect();
  // connectToDatabase();
  console.log(`Server is started on port ${PORT}`);
});
