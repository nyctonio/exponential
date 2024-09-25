const errorParser = (message: string, data: object) => {
  console.log('message is ', message, ' and data is ', data);
  Object.keys(data).map((item) => {
    message = message.replace(`:${item}`, data[`${item}`] || '-');
  });
  return message;
};
export default errorParser;
