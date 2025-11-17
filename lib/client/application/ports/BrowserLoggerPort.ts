export interface BrowserLoggerPort {
  log(message: string): void;
  error(message: string): void;
}