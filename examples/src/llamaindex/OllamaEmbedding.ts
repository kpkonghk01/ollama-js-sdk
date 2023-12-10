import { BaseEmbedding } from "llamaindex";
import type OllamaClient from "../../../src/OllamaClient.js";
import { EmbeddingCommand } from "../../../src/commands/EmbeddingCommand.js";

type OllamaEmbeddingConfig = {
  client: OllamaClient;
  model: string;
};

export class OllamaEmbedding extends BaseEmbedding {
  client: OllamaClient;
  model: string;

  constructor(init: OllamaEmbeddingConfig) {
    super();
    this.client = init.client;
    this.model = init.model;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const data = await this.client.send(
      new EmbeddingCommand({ prompt: text, model: this.model })
    );

    return data.embedding;
  }

  getQueryEmbedding(query: string): Promise<number[]> {
    return this.getTextEmbedding(query);
  }
}
