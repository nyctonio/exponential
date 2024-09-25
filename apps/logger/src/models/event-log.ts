// import mongoose from 'mongoose';
// const eventLogSchema = new mongoose.Schema(
//   {
//     operation: {
//       type: String,
//       required: true,
//     },
//     loggedInUser: {
//       type: Number,
//       required: false,
//     },
//     targetUsers: [
//       {
//         type: Number,
//       },
//     ],
//     actionDoneBy: {
//       type: String,
//       enum: ['system', 'user'],
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     metadata: {
//       type: JSON,
//       default: {},
//     },
//   },
//   { timestamps: true }
// );

// const EventLog = mongoose.model('eventlogs', eventLogSchema);
// export default EventLog;

import mongoose, { Schema, Document, Model } from 'mongoose';

interface IEventLog extends Document {
  operation: string;
  loggedInUser?: number;
  targetUsers: number[];
  actionDoneBy: 'system' | 'user';
  description: string;
  type: string;
  metadata: Record<string, any>;
}

const eventLogSchema: Schema<IEventLog> = new Schema<IEventLog>(
  {
    operation: {
      type: String,
      required: true,
    },
    loggedInUser: {
      type: Number,
      required: false,
    },
    targetUsers: [
      {
        type: Number,
      },
    ],
    actionDoneBy: {
      type: String,
      enum: ['system', 'user'],
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const EventLog: Model<IEventLog> = mongoose.model<IEventLog>(
  'eventlogs',
  eventLogSchema
);
export default EventLog;
