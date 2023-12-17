import readline from "readline";
import { stdin as input, stdout as output } from "process";
import OllamaClient from "../../../src/OllamaClient.js";
import { VectorEmbeddingModel } from "./db/models/VectorEmbedding.js";
import { db } from "./db/pool.js";
import { TagAdviser } from "./TagAdviser.js";

const OLLAMA_HOST = "http://localhost:11434";
const ollama = new OllamaClient({
  baseURL: OLLAMA_HOST,
  timeout: 1000 * 60,
});
const model = "Taiwan-LLM-13B-v2.0-chat";

const store = new VectorEmbeddingModel(db);

const advisor = new TagAdviser(ollama, model, store);

const rl = readline.createInterface({ input, output });

async function tagSuggestion(message: string) {
  const predictedTags = await advisor.suggest(message);

  console.log(`suggested tags: ${predictedTags.join(", ")}\n\n`);

  // wait 5 seconds to avoid gpu overheat
  await new Promise((resolve) => setTimeout(resolve, 5000));

  rl.question("請輸入文章內容\n", tagSuggestion);
}

rl.question("請輸入文章內容\n", tagSuggestion);

// helpers
