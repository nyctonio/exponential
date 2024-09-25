import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      return `[${info.timestamp}] [${info.level.toUpperCase()}] - ${
        info.message
      }`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }), // Log to a file
  ],
});

export { logger };
