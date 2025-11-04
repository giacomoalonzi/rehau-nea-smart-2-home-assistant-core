import winston from 'winston';
import { LogLevel } from './types';

const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
      
      // Add metadata if present
      if (Object.keys(meta).length > 0) {
        // Filter out empty objects and stack traces for cleaner output
        const filteredMeta = Object.entries(meta)
          .filter(([key, value]) => {
            if (key === 'stack') return false;
            if (typeof value === 'object' && Object.keys(value as object).length === 0) return false;
            return true;
          })
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
        if (Object.keys(filteredMeta).length > 0) {
          msg += ' ' + JSON.stringify(filteredMeta, null, 2);
        }
      }
      
      return msg;
    })
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error']
    })
  ]
});

export default logger;
