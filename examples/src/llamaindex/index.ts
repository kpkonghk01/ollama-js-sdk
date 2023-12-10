import OllamaClient from "../../../src/OllamaClient.js";
import {
  MetadataMode,
  PGVectorStore,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
import docs from "./docs.js";
import { OllamaIndex } from "./OllamaIndex.js";
import { ChatStrategy } from "./messageHelpers.js";
import { OllamaEmbedding } from "./OllamaEmbedding.js";
import {
  GenerateCommand,
  isGenerateResponseStream,
} from "../../../src/commands/GenerateCommand.js";
import ragTemplate from "./ragTemplate.js";
import readline from "readline";
import { stdin as input, stdout as output } from "process";
import { CustomNodeParser } from "./CustomNodeParser.js";

const rl = readline.createInterface({ input, output });

const OLLAMA_HOST = "http://localhost:11434";
const ollama = new OllamaClient({
  baseURL: OLLAMA_HOST,
  timeout: 1000 * 60,
});
const model = "Taiwan-LLM-13B-v2.0-chat";

// How can I use connection pool? source code no way to pass pool or pool options here, can't event pass client
// what if I have 2 pg databases? no way to customize the connection settings other than the fixed env keys?
process.env.PGUSER = "ollama";
process.env.PGPASSWORD = "";
process.env.PGHOST = "localhost";
process.env.PGDATABASE = "ollama";
process.env.PGPORT = "5432";
const vectorStore = new PGVectorStore();
vectorStore.client();
// also no way to set PGVECTOR_TABLE name, wtf
// https://github.com/run-llama/LlamaIndexTS/blob/b9a5a0498a158e5281333f5176e482c64a5fd789/packages/core/src/storage/vectorStore/PGVectorStore.ts#L103

// WTF, embedding dimension is fixed to 1536, no way to customize, the ollama model I used has embedding dimension 5120
// https://github.com/run-llama/LlamaIndexTS/blob/b9a5a0498a158e5281333f5176e482c64a5fd789/packages/core/src/storage/vectorStore/PGVectorStore.ts#L99

// WTF, run this sql before running this example
// CREATE TABLE IF NOT EXISTS public.llamaindex_embedding (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   external_id VARCHAR,
//   collection VARCHAR,
//   document TEXT,
//   metadata JSONB DEFAULT '{}',
//   embeddings VECTOR(5120)
// )

const serviceContext = serviceContextFromDefaults({
  llm: new OllamaIndex({
    client: ollama,
    model,
    chatStrategy: ChatStrategy.A16Z,
    temperature: 0,
    topP: 0,
  }),
  embedModel: new OllamaEmbedding({ client: ollama, model }),
  nodeParser: new CustomNodeParser({
    includeMetadata: true,
  }),
});

const initDocs = false;

// https://www.hk-hphi.com/single-post/%E6%B7%B1%E5%85%A5%E6%BD%9B%E6%84%8F%E8%AD%98%E3%80%81%E6%8F%AD%E9%96%8B%E5%BF%83%E7%90%86%E5%AD%B8%E4%B9%8B%E8%AC%8E
VectorStoreIndex.fromDocuments(initDocs ? docs : [], {
  serviceContext,
  vectorStore,
}).then(async (index) => {
  // No way to customize the QA prompt template by using `asQueryEngine`

  const retriever = index.asRetriever({
    // https://github.dev/run-llama/LlamaIndexTS/blob/main/examples/pg-vector-store/query.ts
    similarityTopK: 1,
  });

  // The template it uses is hard-coded in the source code, difficult to customize, need to implement ResponseSynthesizer, ResponseBuilder
  // const queryEngine = index.asQueryEngine({ retriever });
  // const response = await queryEngine.query("請講解潛意識的起源和歷史");

  // const message = "請講解潛意識的起源和歷史";

  async function questionHandler(message: string) {
    const response = await retriever.retrieve(message);
    const context = response
      .map(({ node }) => {
        console.log("meta: ", node.getMetadataStr(MetadataMode.ALL));
        return node.getContent(MetadataMode.NONE);
      })
      .join("\n\n"); // only 1 concatenated context with metadata

    const resp = await ollama.send(
      new GenerateCommand({
        model,
        prompt: ragTemplate({
          context,
          message,
        }),
        stream: true,
        raw: true,
      })
    );

    if (isGenerateResponseStream(resp)) {
      const reader = resp.getReader();

      let done = false;

      while (!done) {
        const { value, done: _done } = await reader.read();

        if (value) {
          process.stdout.write(value.response);
        }

        done = _done;
      }

      console.log("\n");
    }

    rl.question("請問還有甚麼問題？\n", questionHandler);
  }

  rl.question("請問有甚麼想知道？\n", questionHandler);
});
