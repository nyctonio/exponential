import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from 'env';
import models from './schema';

let entities = [];
for (let k in models) {
  entities.push(models[k]);
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  database: env.DATABASE,
  host: env.HOST_NAME,
  password: env.PASSWORD,
  port: parseInt(env.DATABASE_PORT),
  username: env.USER_NAME,
  useUTC: true,
  logging: false,
  entities: entities,
  migrations: [],
  subscribers: [],
});
