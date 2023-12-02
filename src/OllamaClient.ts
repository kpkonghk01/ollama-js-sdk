import type { Command } from "./interfaces/Command.js";
import type { Client } from "./interfaces/Client.js";
import axios, { type AxiosInstance, type CreateAxiosDefaults } from "axios";

class OllamaClient implements Client {
  public readonly inst: AxiosInstance;

  constructor(config: CreateAxiosDefaults) {
    this.inst = axios.create({
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    });
  }

  send<T>(command: Command<T>): Promise<T> {
    return command.execute(this.inst);
  }
}

export default OllamaClient;
