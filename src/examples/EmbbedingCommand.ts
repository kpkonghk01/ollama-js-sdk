import OllamaClient from "../OllamaClient.js";
import {
  EmbeddingCommand,
  type EmbeddingRequest,
} from "../commands/EmbeddingCommand.js";

const OLLAMA_HOST = "http://localhost:11434";

const ollama = new OllamaClient({
  baseURL: OLLAMA_HOST,
});
const model = "Taiwan-LLM-13B-v2.0-chat";

const request: EmbeddingRequest = {
  model,
  prompt:
    "Help me translate `Did you know you can use tildes instead of backticks for code in markdown? ✨` into Chinese",
};

// Create an instance of the EmbeddingCommand
const command = new EmbeddingCommand(request);

// Send the command using the client
ollama
  .send(command)
  .then((response) => {
    console.log("Embeddings:", response.embedding);
    //   Embeddings: [
    //     -1.2922241687774658,   1.2528910636901855,   0.3623347580432892,
    //    ...
    //  ]
  })
  .catch((error) => {
    console.error("Error:", error);
  });
