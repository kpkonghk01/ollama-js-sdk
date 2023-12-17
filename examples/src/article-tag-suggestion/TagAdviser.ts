import type OllamaClient from "../../../src/OllamaClient.js";
import { EmbeddingCommand } from "../../../src/commands/EmbeddingCommand.js";
import type { VectorEmbeddingModel } from "./db/models/VectorEmbedding.js";

export class TagAdviser {
  constructor(
    private readonly ollama: OllamaClient,
    private readonly model: string,
    private readonly store: VectorEmbeddingModel
  ) {}

  async suggest(content: string) {
    const query = (
      await this.ollama.send(
        new EmbeddingCommand({
          model: this.model,
          prompt: content,
        })
      )
    ).embedding;

    const similarArticles = await this.store.similaritySearch(query, 3, {
      collection: "hk01_articles",
    });

    const similarTags = similarArticles
      .map((article) => article.metadata.tags as string[])
      .flat();

    // aggregate similarTags and order by frequency
    const tagFrequencyMap = new Map<string, number>();
    for (const tag of similarTags) {
      tagFrequencyMap.set(tag, (tagFrequencyMap.get(tag) ?? 0) + 1);
    }

    // get top 3 tags
    return [...tagFrequencyMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
  }
}
