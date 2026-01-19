import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// ✅ Console format (for terminal with colors)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, caller, ...meta }) => {
    let msg = `${timestamp} [${level}]`;
    
    if (caller) {
      msg += ` [${caller}]`;
    }
    
    msg += `: ${message}`;
    
    const metaKeys = Object.keys(meta).filter(key => 
      !['timestamp', 'level', 'message', 'caller'].includes(key)
    );
    if (metaKeys.length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    
    return msg;
  })
);

// ✅ File log format
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, caller, ...meta }) => {
    let msg = `${timestamp} [${level}]`;
    
    if (caller) {
      msg += ` [${caller}]`;
    }
    
    msg += `: ${message}`;
    
    const metaKeys = Object.keys(meta).filter(key => 
      !['timestamp', 'level', 'message', 'caller'].includes(key)
    );
    if (metaKeys.length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    
    return msg;
  })
);

// ✅ Check if running on Vercel or serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME;

// ✅ Create transports array
const transports = [];

// ✅ Add file transports only in local/non-serverless environment
if (!isServerless) {
  transports.push(
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    })
  );
}

// ✅ Always add console transport (works everywhere)
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" 
      ? fileFormat  // Production: structured logs
      : consoleFormat // Development: colored logs
  })
);

// ✅ Base Winston Logger
const baseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports,
  exceptionHandlers: isServerless 
    ? [new winston.transports.Console({ format: fileFormat })]
    : [
        new DailyRotateFile({
          filename: "logs/exceptions-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "30d",
          format: fileFormat,
        }),
        new winston.transports.Console({ format: fileFormat })
      ],
  rejectionHandlers: isServerless
    ? [new winston.transports.Console({ format: fileFormat })]
    : [
        new DailyRotateFile({
          filename: "logs/rejections-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "30d",
          format: fileFormat,
        }),
        new winston.transports.Console({ format: fileFormat })
      ],
});

// ✅ Get caller info
const getCallerInfo = () => {
  try {
    const stack = new Error().stack;
    if (!stack) return 'unknown:0';

    const lines = stack.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('logger.js') || 
          line.includes('node_modules') ||
          line.includes('node:internal') ||
          line.includes('node:events')) {
        continue;
      }

      let match = line.match(/file:\/\/\/([^)]+):(\d+):(\d+)/);
      if (match) {
        let filePath = match[1];
        const lineNumber = match[2];
        filePath = decodeURIComponent(filePath);
        const fileName = filePath.split('/').pop();
        return `${fileName}:${lineNumber}`;
      }
      
      match = line.match(/\(([A-Z]:[^)]+):(\d+):(\d+)\)/);
      if (match) {
        const filePath = match[1];
        const lineNumber = match[2];
        const fileName = filePath.split('\\').pop();
        return `${fileName}:${lineNumber}`;
      }
      
      match = line.match(/at .+ \((.+):(\d+):(\d+)\)/);
      if (match) {
        const filePath = match[1];
        const lineNumber = match[2];
        
        if (!filePath.includes('node_modules')) {
          const fileName = filePath.split('/').pop();
          return `${fileName}:${lineNumber}`;
        }
      }
    }
    
    return 'unknown:0';
  } catch (error) {
    return 'unknown:0';
  }
};

// ✅ Wrapper Logger
const logger = {
  info: (message, meta = {}) => {
    const caller = getCallerInfo();
    baseLogger.info(message, { ...meta, caller });
  },
  
  error: (message, meta = {}) => {
    const caller = getCallerInfo();
    baseLogger.error(message, { ...meta, caller });
  },
  
  warn: (message, meta = {}) => {
    const caller = getCallerInfo();
    baseLogger.warn(message, { ...meta, caller });
  },
  
  debug: (message, meta = {}) => {
    const caller = getCallerInfo();
    baseLogger.debug(message, { ...meta, caller });
  },
  
  verbose: (message, meta = {}) => {
    const caller = getCallerInfo();
    baseLogger.verbose(message, { ...meta, caller });
  },
  
  silly: (message, meta = {}) => {
    const caller = getCallerInfo();
    baseLogger.silly(message, { ...meta, caller });
  },
};

export default logger;