import OllamaClient from "../../dist/OllamaClient.js";
import {
  GenerateCommand,
  isGenerateResponseStream,
} from "../../dist/commands/GenerateCommand.js";

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
