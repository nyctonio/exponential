import mongoose, { Schema, Document } from 'mongoose';

interface IDataModel extends Document {
  status: string;
  priority: number;
  condition: string;
  keyword?: string; // Example of an optional field
  level: string;
  points?: number; // Example of an optional field
}

const dataModelSchema: Schema = new Schema(
  {
    status: {
      type: String,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    keyword: {
      type: String,
    },
    level: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const DataModel = mongoose.model<IDataModel>(
  'rules_model',
  dataModelSchema,
  'rules_model'
);
export default DataModel;

// model.insertMany(
//     [{
//         "status": "Active",
//         "priority": 1,
//         "condition": "location",
//         "level": "high"
//     },
//     {
//         "status": "Active",
//         "priority": 2,
//         "condition": "ip",
//         "level": "high"
//     },
//     {
//         "status": "Active",
//         "priority": 3,
//         "condition": "deviceType and deviceId",
//         "level": "high"

//     }]
// )
