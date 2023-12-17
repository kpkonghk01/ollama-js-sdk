// yarn tsx ./src/article-tag-suggestion/fetchData.ts

import fs from "fs";
import { parse, HTMLElement } from "node-html-parser";
import type { InsertVectorEmbedding } from "./db/models/VectorEmbedding.js";
import { ids_train, ids_test } from "./raw/ids.js";

const baseUrl = "https://hk01.com/article/";
const __dirname = new URL(".", import.meta.url).pathname;

const startId: string | undefined = undefined;
let startFlag = false;

// main
for (const ids of [ids_train, ids_test]) {
  for (const id of ids) {
    if (!startId || (startId && id === startId)) {
      startFlag = true;
    }

    if (!startFlag) {
      continue;
    }

    console.log(`processing ${id}`);

    const root = await getDocument(id);

    const tags = getTags(root);
    const content = getContent(root);

    const data: InsertVectorEmbedding = {
      external_id: id,
      collection: "hk01_articles",
      document: content,
      metadata: {
        tags,
      },
      embeddings: [],
    };

    fs.writeFileSync(
      `${__dirname}raw/articles/${id}.json`,
      JSON.stringify(data)
    );

    console.log(`done ${id}`);
  }
}

// helpers
async function getDocument(id: string) {
  const html = await getHTML(id);
  return parse(html);
}

async function getHTML(id: string) {
  let html = "";

  const resp = await fetch(getUrl(id));
  const reader = resp.body?.getReader();

  if (!reader) {
    throw new Error("no reader");
  }

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    html += new TextDecoder("utf-8").decode(value);
  }

  return html;
}

function getUrl(id: string) {
  return `${baseUrl}${id}`;
}

function getTags(document: HTMLElement) {
  return [
    ...document.querySelectorAll(
      "div.article-grid--article-top div.mt-\\[26px\\].mb-\\[14px\\].flex.flex-wrap a"
    ),
  ].map((t) => t.textContent);
}

function getContent(document: HTMLElement) {
  const content$ = document.querySelector("#article-content-section");

  if (!content$) {
    throw new Error("no content");
  }

  return content$.textContent;
}
