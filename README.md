# Ollama-js-sdk

A sdk for consuming Ollama API in js according to [Ollama API doc](https://github.com/jmorganca/ollama/blob/main/docs/api.md)

## Usage

### Generate text completion

```ts
import OllamaClient from "../OllamaClient.js";
import {
  GenerateCommand,
  isGenerateResponseStream,
} from "../commands/GenerateCommand.js";

const OLLAMA_HOST = "http://localhost:11434";

const ollama = new OllamaClient({
  baseURL: OLLAMA_HOST,
});
const model = "Taiwan-LLM-13B-v2.0-chat";

ollama
  .send(
    new GenerateCommand({
      model,
      prompt:
        "USER: Help me translate `Did you know you can use tildes instead of backticks for code in markdown? ✨` into Chinese\nASSISTANT: ",
      stream: true,
      // stream: false,
    })
  )
  .then(async (data) => {
    if (isGenerateResponseStream(data)) {
      const reader = data.getReader();

      function log() {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log("done", done);
            return;
          }

          console.log(done, value);
          // {
          //   model: 'Taiwan-LLM-13B-v2.0-chat',
          //   created_at: '2023-11-26T00:05:15.319128107Z',
          //   response: '你知道在markdown中，',
          //   done: false
          // }
          // {
          //   model: 'Taiwan-LLM-13B-v2.0-chat',
          //   created_at: '2023-11-26T00:05:16.319128107Z',
          //   response: '可以使用破折號代替反引號來表示程式碼嗎？🐍',
          //   done: true
          // }

          log();
        });
      }

      log();
    } else {
      console.log(data);
      // {
      //   model: 'Taiwan-LLM-13B-v2.0-chat',
      //   created_at: '2023-11-26T00:05:15.319128107Z',
      //   response: '你知道在markdown中，可以使用破折號代替反引號來表示程式碼嗎？🐍',
      //   done: true
      // }
    }
  });

```

### Generate embedding

```ts
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

```
