// yarn tsx ./src/article-tag-suggestion/initVectorStore.ts

import OllamaClient from "../../../src/OllamaClient.js";
import { VectorEmbeddingModel } from "./db/models/VectorEmbedding.js";
import { db } from "./db/pool.js";
import { ids_train } from "./raw/ids.js";
import { EmbeddingCommand } from "../../../src/commands/EmbeddingCommand.js";
import { getArticle } from "./helpers.js";

const OLLAMA_HOST = "http://localhost:11434";
const ollama = new OllamaClient({
  baseURL: OLLAMA_HOST,
  timeout: 1000 * 60,
});
const model = "Taiwan-LLM-13B-v2.0-chat";

const store = new VectorEmbeddingModel(db);

const startId: string | undefined = undefined;
let startFlag = false;

// main
for (const id of ids_train) {
  if (!startId || (startId && id === startId)) {
    startFlag = true;
  }

  if (!startFlag) {
    continue;
  }

  console.log(`processing ${id}`);

  const data = await getArticle(id);

  data.embeddings = (
    await ollama.send(
      new EmbeddingCommand({
        model,
        prompt: data.document,
      })
    )
  ).embedding;

  await store.insert(data);

  console.log(`done ${id}`);

  // wait 5 seconds to avoid gpu overheat
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
