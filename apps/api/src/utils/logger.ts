import { log } from 'console';
import Rabbit from 'lib/rabbit';
import { queue } from '../lib/queue';

class logSave {
  public static async logQueue(message: any) {
    queue.publish('logsqueue', JSON.stringify(message));
    return;
  }
}

export default logSave;
