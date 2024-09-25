import mongoose, { Schema, Document } from 'mongoose';

interface IDataModel extends Document {
  variationMax?: number;
  variationMin?: number;
  timeAllowedMax?: number;
  timeAllowedMin?: number;
  flag?: string;
}

const dataModelSchema: Schema = new Schema(
  {
    variationMax: {
      type: Number,
    },
    variationMin: {
      type: Number,
    },
    timeAllowedMax: {
      type: Number,
    },
    timeAllowedMin: {
      type: Number,
    },
    flag: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const DataModel = mongoose.model<IDataModel>(
  'sucpicious_trade_settings',
  dataModelSchema,
  'sucpicious_trade_settings'
);
export default DataModel;

// model.insertMany(
//     [{
//         "flag": "deepred",
//         "timeAllowedMax": 15,
//         "timeAllowedMin": 1,
//         "variationMax": 10,
//         "variationMin": 8
//       },
//       {
//         "flag": "red",
//         "timeAllowedMax": 30,
//         "timeAllowedMin": 16,
//         "variationMax": 7,
//         "variationMin": 6
//       },
//       {
//         "flag": "amber",
//         "timeAllowedMax": 0,
//         "timeAllowedMin": 31,
//         "variationMax": 5,
//         "variationMin": 0
//       }]
// )
