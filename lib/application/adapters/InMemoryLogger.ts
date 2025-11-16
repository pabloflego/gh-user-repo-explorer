import { LoggerPort } from "@/lib/application/ports/LoggerPort";

export class InMemoryLogger implements LoggerPort {

  constructor(private prefix: string = '') {}

  log(message: string): void {
    console.log(`[${this.prefix}]:`, message);
  }

  error(message: string): void {
    console.error(`[${this.prefix}]:`, message);
  }
}