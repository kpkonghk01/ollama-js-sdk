import { type ChatMessage, type MessageType } from "llamaindex";

// almost copy from LlamaDeuce, these helpers are not dependent on the class, they're also useful for other llama models
// maybe put them into a LlamaMessagesUtils or something?
export enum ChatStrategy {
  A16Z = "a16z",
  META = "meta",
  METAWBOS = "metawbos",
  //^ This is not exactly right because SentencePiece puts the BOS and EOS token IDs in after tokenization
  // Unfortunately any string only API won't support these properly.
  REPLICATE4BIT = "replicate4bit",
  //^ To satisfy Replicate's 4 bit models' requirements where they also insert some INST tags
  REPLICATE4BITWNEWLINES = "replicate4bitwnewlines",
  //^ Replicate's documentation recommends using newlines: https://replicate.com/blog/how-to-prompt-llama
}

export function mapMessagesToPrompt(
  messages: ChatMessage[],
  chatStrategy: ChatStrategy
) {
  if (chatStrategy === ChatStrategy.A16Z) {
    return mapMessagesToPromptA16Z(messages);
  } else if (chatStrategy === ChatStrategy.META) {
    return mapMessagesToPromptMeta(messages);
  } else if (chatStrategy === ChatStrategy.METAWBOS) {
    return mapMessagesToPromptMeta(messages, { withBos: true });
  } else if (chatStrategy === ChatStrategy.REPLICATE4BIT) {
    return mapMessagesToPromptMeta(messages, {
      replicate4Bit: true,
      withNewlines: true,
    });
  } else if (chatStrategy === ChatStrategy.REPLICATE4BITWNEWLINES) {
    return mapMessagesToPromptMeta(messages, {
      replicate4Bit: true,
      withNewlines: true,
    });
  } else {
    return mapMessagesToPromptMeta(messages);
  }
}

function mapMessagesToPromptA16Z(messages: ChatMessage[]) {
  return {
    prompt:
      messages.reduce((acc, message) => {
        return (
          (acc && `${acc}\n\n`) +
          `${mapMessageTypeA16Z(message.role)}${message.content}`
        );
      }, "") + "\n\nAssistant:",
    //^ Here we're differing from A16Z by omitting the space. Generally spaces at the end of prompts decrease performance due to tokenization
    systemPrompt: undefined,
  };
}

function mapMessageTypeA16Z(messageType: MessageType): string {
  switch (messageType) {
    case "user":
      return "User: ";
    case "assistant":
      return "Assistant: ";
    case "system":
      return "";
    default:
      throw new Error("Unsupported Llama message type");
  }
}

function mapMessagesToPromptMeta(
  messages: ChatMessage[],
  opts?: {
    withBos?: boolean;
    replicate4Bit?: boolean;
    withNewlines?: boolean;
  }
) {
  const {
    withBos = false,
    replicate4Bit = false,
    withNewlines = false,
  } = opts ?? {};
  const DEFAULT_SYSTEM_PROMPT = `You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.`;

  const B_SYS = "<<SYS>>\n";
  const E_SYS = "\n<</SYS>>\n\n";
  const B_INST = "[INST]";
  const E_INST = "[/INST]";
  const BOS = "<s>";
  const EOS = "</s>";

  if (messages.length === 0) {
    return { prompt: "", systemPrompt: undefined };
  }

  messages = [...messages]; // so we can use shift without mutating the original array

  let systemPrompt = undefined;
  if (messages[0]!.role === "system") {
    const systemMessage = messages.shift()!;

    if (replicate4Bit) {
      systemPrompt = systemMessage.content;
    } else {
      const systemStr = `${B_SYS}${systemMessage.content}${E_SYS}`;

      // TS Bug: https://github.com/microsoft/TypeScript/issues/9998
      // @ts-ignore
      if (messages[0].role !== "user") {
        throw new Error(
          "Llama: if there is a system message, the second message must be a user message."
        );
      }

      const userContent = messages[0]!.content;

      messages[0]!.content = `${systemStr}${userContent}`;
    }
  } else {
    if (!replicate4Bit) {
      messages[0]!.content = `${B_SYS}${DEFAULT_SYSTEM_PROMPT}${E_SYS}${
        messages[0]!.content
      }`;
    }
  }

  return {
    prompt: messages.reduce((acc, message, index) => {
      if (index % 2 === 0) {
        return (
          `${acc}${
            withBos ? BOS : ""
          }${B_INST} ${message.content.trim()} ${E_INST}` +
          (withNewlines ? "\n" : "")
        );
      } else {
        return (
          `${acc} ${message.content.trim()}` +
          (withNewlines ? "\n" : " ") +
          (withBos ? EOS : "")
        ); // Yes, the EOS comes after the space. This is not a mistake.
      }
    }, ""),
    systemPrompt,
  };
}
