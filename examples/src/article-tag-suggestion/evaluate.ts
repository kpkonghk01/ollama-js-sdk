// evaluate the model
import fs from "fs";
import OllamaClient from "../../../src/OllamaClient.js";
import { TagAdviser } from "./TagAdviser.js";
import { VectorEmbeddingModel } from "./db/models/VectorEmbedding.js";
import { db } from "./db/pool.js";
import { getArticle } from "./helpers.js";
import { ids_test } from "./raw/ids.js";

const OLLAMA_HOST = "http://localhost:11434";
const ollama = new OllamaClient({
  baseURL: OLLAMA_HOST,
  timeout: 1000 * 60,
});
const model = "Taiwan-LLM-13B-v2.0-chat";

const store = new VectorEmbeddingModel(db);

const advisor = new TagAdviser(ollama, model, store);

const predictions: string[][] = [];
const actual: string[][] = [];

// main
for (const id of ids_test) {
  console.log(`processing ${id}`);

  const data = await getArticle(id);
  actual.push(data.metadata.tags);

  const predictedTags = await advisor.suggest(data.document);
  predictions.push(predictedTags);

  console.log(`predicted tags: [${predictedTags.join(", ")}]`);
  console.log(`actual tags: [${data.metadata.tags.join(", ")}]`);

  // wait 5 seconds to avoid gpu overheat
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

// evaluation
console.log(`accuracy: ${accuracy(predictions, actual)}`);
console.log(`avg precision: ${avgPrecision(predictions, actual)}`);
console.log(`avg recall: ${avgRecall(predictions, actual)}`);
console.log(`f1 score: ${f1Score(predictions, actual)}`);

fs.writeFileSync("results.json", JSON.stringify({ predictions, actual }));

// helpers

// evaluation based on
// https://www.evidentlyai.com/classification-metrics/multi-class-metrics
// if one of the predicted tags is in the actual tags, then it is a correct suggestion.
function accuracy(predicted: string[][], actual: string[][]) {
  return (
    predicted.filter((tags, i) => tags.some((tag) => actual[i]!.includes(tag)))
      .length / predicted.length
  );
}

// Precision = #True_Positive / (#True_Positive + #False_Positive)
function precisionForTarget(
  target: string,
  predicted: string[][],
  actual: string[][]
) {
  const truePositive = predicted.filter(
    (tags, i) => tags.includes(target) && actual[i]!.includes(target)
  ).length;
  const falsePositive = predicted.filter(
    (tags, i) => tags.includes(target) && !actual[i]!.includes(target)
  ).length;

  if (truePositive + falsePositive === 0) {
    return 0;
  }

  return truePositive / (truePositive + falsePositive);
}

function avgPrecision(predicted: string[][], actual: string[][]) {
  // only count the predicted tags, many actual tags are only used in handful of articles, so it is not a good metric.
  const allTags = new Set(predicted.flat());

  const precisions = [...allTags].map((tag) =>
    precisionForTarget(tag, predicted, actual)
  );

  return precisions.reduce((a, b) => a + b, 0) / precisions.length;
}

// Recall = #True_Positive / (#True_Positive + #False_Negatives)
function recallForTarget(
  target: string,
  predicted: string[][],
  actual: string[][]
) {
  const truePositive = predicted.filter(
    (tags, i) => tags.includes(target) && actual[i]!.includes(target)
  ).length;
  const falseNegative = predicted.filter(
    (tags, i) => !tags.includes(target) && actual[i]!.includes(target)
  ).length;

  if (truePositive + falseNegative === 0) {
    return 0;
  }

  return truePositive / (truePositive + falseNegative);
}

function avgRecall(predicted: string[][], actual: string[][]) {
  // only count the predicted tags, many actual tags are only used in handful of articles, so it is not a good metric.
  const allTags = new Set(predicted.flat());

  const recalls = [...allTags].map((tag) =>
    recallForTarget(tag, predicted, actual)
  );

  return recalls.reduce((a, b) => a + b, 0) / recalls.length;
}

// F1 Score: the harmonic mean of precision and recall.
function f1Score(predicted: string[][], actual: string[][]) {
  const precisions = avgPrecision(predicted, actual);
  const recalls = avgRecall(predicted, actual);

  return (2 * precisions * recalls) / (precisions + recalls);
}
