import type { InsertVectorEmbedding } from "./db/models/VectorEmbedding.js";

const __dirname = new URL(".", import.meta.url).pathname;

export async function getArticle(id: string) {
  // esm dynamic import
  const { default: data } = (await import(
    `${__dirname}raw/articles/${id}.json`,
    {
      assert: { type: "json" },
    }
  )) as { default: InsertVectorEmbedding };

  return data;
}
