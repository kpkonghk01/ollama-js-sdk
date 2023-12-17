import type { Pool } from "pg";

export class VectorEmbeddingModel {
  constructor(private readonly db: Pool) {}

  async insert(data: InsertVectorEmbedding) {
    await this.db.query(
      `
      INSERT INTO vector_embedding (external_id, collection, document, metadata, embeddings)
      VALUES ($1, $2, $3, $4, $5);
    `,
      [
        data.external_id,
        data.collection,
        data.document,
        data.metadata,
        `[${data.embeddings.join(",")}]`,
      ]
    );
  }

  async similaritySearch(
    query: number[],
    topK: number,
    { collection }: { collection?: string } = {}
  ) {
    const vectorQuery = `'[${query.join(",")}]'`;

    const result = await this.db.query<
      Omit<VectorEmbedding, "embeddings"> & { similarity: number }
    >(`
      SELECT id, external_id, collection, document, metadata, 1 - (embeddings <=> ${vectorQuery}::vector) as "similarity" 
      FROM vector_embedding
      ${collection ? `WHERE collection = '${collection}'` : ""}
      ORDER BY "similarity" DESC
      LIMIT ${topK};
    `);

    return result.rows;
  }
}

export type InsertVectorEmbedding = {
  external_id: string;
  collection: string;
  document: string;
  metadata: Record<string, any>;
  embeddings: number[];
};

export type VectorEmbedding = {
  id: string;
  external_id: string;
  collection: string;
  document: string;
  metadata: Record<string, any>;
  embeddings: number[];
};
