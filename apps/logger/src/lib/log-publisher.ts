import EventLog from '../models/event-log';
// import { EventLog } from '../../../../packages/database/mongodb/models';

async function logPublisher(message: any) {
  message = JSON.parse(message);

  const saveData = new EventLog({
    operation: message.operation,
    loggedInUser: message.loggedInUser,
    type: message.type,
    targetUsers: message.targetUsers,
    actionDoneBy: message.actionDoneBy,
    description: message.description,
    metadata: message.metadata,
  });

  const newEvent = await saveData.save();
  console.log('new log event is ======>', newEvent);

  return;
}

export default logPublisher;
