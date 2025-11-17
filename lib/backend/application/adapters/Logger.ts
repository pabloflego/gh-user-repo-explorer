import type { LoggerPort } from "@/lib/backend/application/ports/LoggerPort";

export class Logger implements LoggerPort {

  constructor(
    private prefix: string = '',
    private provider: { log: Function, error: Function} = console
  ) {}

  log(message: string): void {
    this.provider.log(`[${this.prefix}]`, message);
  }

  error(message: string): void {
    this.provider.error(`[${this.prefix}]`, message);
  }
}