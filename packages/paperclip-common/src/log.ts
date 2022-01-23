export enum LogLevel {
  Verbose = 1,
  Info = 1 << 1,
  Warn = 1 << 2,
  Error = 1 << 3,
  All = LogLevel.Verbose | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
  None = 0,
}

export class Logger {
  constructor(readonly logLevel: LogLevel = LogLevel.All) {}
  info(...args) {
    if (this.logLevel & LogLevel.Info) {
      console.info(...args);
    }
  }
  warn(...args) {
    if (this.logLevel & LogLevel.Warn) {
      console.warn(...args);
    }
  }
  error(...args) {
    if (this.logLevel & LogLevel.Error) {
      console.error(...args);
    }
  }
  verbose(...args) {
    if (this.logLevel & LogLevel.Verbose) {
      console.log(...args);
    }
  }
}
