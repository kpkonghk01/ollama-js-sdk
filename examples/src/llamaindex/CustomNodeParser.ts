import {
  SentenceSplitter,
  type NodeParser,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
  BaseNode,
  getNodesFromDocument,
} from "llamaindex";

// get content is wrong, it should not include metadata
// https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L192-L195

export class CustomNodeParser implements NodeParser {
  /**
   * The text splitter to use.
   */
  textSplitter: SentenceSplitter;
  /**
   * Whether to include metadata in the nodes.
   */
  includeMetadata: boolean;
  /**
   * Whether to include previous and next relationships in the nodes.
   */
  includePrevNextRel: boolean;

  constructor(init?: {
    textSplitter?: SentenceSplitter;
    includeMetadata?: boolean;
    includePrevNextRel?: boolean;

    chunkSize?: number;
    chunkOverlap?: number;
  }) {
    this.textSplitter =
      init?.textSplitter ??
      new SentenceSplitter({
        chunkSize: init?.chunkSize ?? DEFAULT_CHUNK_SIZE,
        chunkOverlap: init?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
      });
    this.includeMetadata = init?.includeMetadata ?? true;
    this.includePrevNextRel = init?.includePrevNextRel ?? true;
  }

  static fromDefaults(init?: {
    chunkSize?: number;
    chunkOverlap?: number;
    includeMetadata?: boolean;
    includePrevNextRel?: boolean;
  }): CustomNodeParser {
    return new CustomNodeParser(init);
  }

  /**
   * Generate Node objects from documents
   * @param documents
   */
  getNodesFromDocuments(documents: BaseNode[]) {
    return documents
      .map((document) =>
        getNodesFromDocument(
          document,
          this.textSplitter,
          // WTF, the original one don't pass this
          // https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L89C1-L142C2
          this.includeMetadata,
          this.includePrevNextRel
        )
      )
      .flat();
  }
}
