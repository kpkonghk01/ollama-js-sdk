import type { Command } from "./Command.js";

export interface Client {
  send<T>(command: Command<T>): Promise<T>;
}
