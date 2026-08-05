import fs from 'fs/promises';
import path from 'path';

class Logger {
  constructor(logPath = './logs') {
    this.logPath = logPath;
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(this.logPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatLog(level, message, data = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      data
    }) + '\n';
  }

  async writeLog(level, message, data = {}) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logPath, `${level.toLowerCase()}-${timestamp}.log`);
      const logEntry = this.formatLog(level, message, data);
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  info(message, data = {}) {
    console.log(`[INFO] ${this.getTimestamp()}: ${message}`, data);
    this.writeLog('INFO', message, data);
  }

  warn(message, data = {}) {
    console.warn(`[WARN] ${this.getTimestamp()}: ${message}`, data);
    this.writeLog('WARN', message, data);
  }

  error(message, error, data = {}) {
    const errorData = {
      ...data,
      errorMessage: error?.message,
      errorStack: error?.stack
    };
    console.error(`[ERROR] ${this.getTimestamp()}: ${message}`, errorData);
    this.writeLog('ERROR', message, errorData);
  }

  debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${this.getTimestamp()}: ${message}`, data);
      this.writeLog('DEBUG', message, data);
    }
  }
}

export default new Logger();