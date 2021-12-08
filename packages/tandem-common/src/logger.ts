export class Logger {
  info(...args) {
    console.info(...args);
  }
  warn(...args) {
    console.warn(...args);
  }
  error(...args) {
    console.error(...args);
  }
  verbose(...args) {
    console.info(...args);
  }
}
