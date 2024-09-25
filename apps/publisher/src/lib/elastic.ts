import { Client } from '@elastic/elasticsearch';
import { env } from '../constants';

const client = new Client({
  cloud: {
    id: env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: env.ELASTIC_USERNAME,
    password: env.ELASTIC_PASSWORD,
  },
});

export default client;
