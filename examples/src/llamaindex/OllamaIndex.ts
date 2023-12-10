import type { ChatMessage, ChatResponse, LLM, Event } from "llamaindex";
import { mapMessagesToPrompt, type ChatStrategy } from "./messageHelpers.js";
import type OllamaClient from "../../../src/OllamaClient.js";
import {
  GenerateCommand,
  isGenerateResponseStream,
} from "../../../src/commands/GenerateCommand.js";

type OllamaIndexConfig = {
  client: OllamaClient;
  model: string;
  chatStrategy: ChatStrategy;
  temperature?: number;
  topP?: number;
};

export class OllamaIndex implements LLM {
  client: OllamaClient;
  model: string;
  chatStrategy: ChatStrategy;
  temperature: number;
  topP: number;
  hasStreaming = false;

  constructor(init: OllamaIndexConfig) {
    this.client = init.client;
    this.model = init.model;
    this.chatStrategy = init.chatStrategy;
    this.temperature = init?.temperature ?? 0.1; // minimum temperature is 0.01 for Replicate endpoint
    this.topP = init?.topP ?? 0.9;
  }

  tokens(messages: ChatMessage[]): number {
    throw new Error("Method not implemented.");
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: 0,
      contextWindow: 0,
      tokenizer: undefined,
    };
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse
  >(messages: ChatMessage[], _parentEvent?: Event, streaming?: T): Promise<R> {
    const { prompt } = mapMessagesToPrompt(messages, this.chatStrategy);

    // TODO: Add streaming for this

    // Non-streaming
    const data = await this.client.send(
      new GenerateCommand({
        prompt,
        model: this.model,
        stream: false,
        options: {
          temperature: this.temperature,
          top_p: this.topP,
        },
      })
    );

    if (isGenerateResponseStream(data)) {
      throw new Error("Expected non-streaming response from GenerateCommand");
    }

    return {
      message: {
        content: data.response.trimStart(),
        role: "assistant",
      },
    } as R;
  }

  async complete<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse
  >(prompt: string, parentEvent?: Event, streaming?: T): Promise<R> {
    return this.chat([{ content: prompt, role: "user" }], parentEvent);
  }
}
