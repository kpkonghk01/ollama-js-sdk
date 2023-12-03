// commands
import { GenerateCommand } from "./commands/GenerateCommand.js";
import { EmbeddingCommand } from "./commands/EmbeddingCommand.js";

export const commands = {
  GenerateCommand,
  EmbeddingCommand,
};

// utils
import { createTemplate } from "./utils/createTemplate.js";

export const utils = {
  createTemplate,
};

// client
import OllamaClient from "./OllamaClient.js";
export default OllamaClient;
