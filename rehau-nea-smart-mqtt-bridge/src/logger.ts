import winston from 'winston';
import { LogLevel } from './types';

const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

/**
 * Redact sensitive information from objects for safe logging
 * Useful for sharing logs with other developers
 */
export function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }
  
  const redacted: any = {};
  const sensitiveKeys = [
    'password', 'token', 'access_token', 'refresh_token', 'id_token',
    'authorization', 'auth', 'secret', 'api_key', 'apikey',
    'email', 'username', 'user', 'login', 'credential'
  ];
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
    
    if (isSensitive) {
      if (typeof value === 'string' && value.length > 0) {
        // Show first 2 and last 2 characters for strings
        if (value.length <= 4) {
          redacted[key] = '***';
        } else {
          redacted[key] = `${value.substring(0, 2)}...${value.substring(value.length - 2)}`;
        }
      } else {
        redacted[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object') {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Log full message dump in debug mode (with redacted sensitive data)
 */
export function debugDump(label: string, data: any): void {
  if (logLevel === 'debug') {
    const redacted = redactSensitiveData(data);
    logger.debug(`[DUMP] ${label}:\n${JSON.stringify(redacted, null, 2)}`);
  }
}

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
