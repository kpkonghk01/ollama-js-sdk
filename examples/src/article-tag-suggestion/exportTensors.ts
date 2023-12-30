import { db } from "./db/pool.js";
import { appendFileSync } from "fs";

type Datum = {
  id: string;
  external_id: string;
  collection: string;
  metadata: {
    tags: string[];
  };
  embeddings: string; // string form of number[]
};

async function main() {
  let skip = 0;
  let datum: Datum | undefined;

  while (true) {
    const { rows } = await db.query<Datum>(getQuery(skip));
    datum = rows[0];

    if (!datum) {
      break;
    }

    const tags = datum.metadata.tags;
    const tensor = (JSON.parse(datum.embeddings) as number[]).join("\t");

    appendFileSync(
      "metadata.tsv",
      datum.external_id + "-" + tags.join("|") + "\n"
    );
    appendFileSync("tensor.tsv", tensor + "\n");

    skip++;
  }
}

main().then(() => {
  console.log("done");
  process.exit(0);
});

function getQuery(skip: number) {
  return `SELECT
    id, external_id, collection, metadata, embeddings
  FROM vector_embedding
  ORDER BY "id" DESC
  LIMIT 1
  OFFSET ${skip};`;
}
