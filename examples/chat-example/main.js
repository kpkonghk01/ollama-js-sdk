import OllamaClient, { commands, utils } from "/dist/index.js";

const { GenerateCommand } = commands;
const { createTemplate } = utils;

let responding = false;

const OLLAMA_HOST = "http://localhost:11434";
const ollama = new OllamaClient({
  baseURL: OLLAMA_HOST,
  timeout: 1000 * 60,
});
const model = "Taiwan-LLM-13B-v2.0-chat";

async function generateCompletion(prompt, history) {
  responding = true;
  appendAIMsg("");
  const $lastAIMsg = $history.querySelector(".message-ai:last-child p");

  const data = await ollama.send(
    new GenerateCommand({
      model,
      prompt,
      // stream: true,
    })
  );

  const reader = data.getReader();

  function process() {
    reader.read().then(({ done, value }) => {
      if (done) {
        responding = false;
        history.push({
          role: "assistant",
          response: $lastAIMsg.textContent,
        });
        return;
      }

      $lastAIMsg.textContent += value.response;

      process();
    });
  }

  process();
}

const toPrompt = createTemplate`You're an AI assistant.
Given the previous chat history, please answer the User's last question.

Here is the chat history:
----------
${"chatHistory"}
----------
</s>

USER: ${"question"}</s>
ASSISTANT:
`;

const toAIComponent = createTemplate`<div class="container message message-ai">
  <img src="./w3images/llama.jpeg" alt="Avatar" style="width: 100%" />
    <p>${"message"}</p>
  <span class="time-right">${"time"}</span>
</div>`;

const toUserComponent = createTemplate`<div class="container message message-user darker">
  <img
    src="./w3images/me.png"
    alt="Avatar"
    class="right"
    style="width: 100%"
  />
  <p>${"message"}</p>
  <span class="time-left">${"time"}</span>
</div>`;

// {
//   role: "user",
//   content: "Hello, how are you?",
// }
const chatHistory = [];
chatHistory.toString = function () {
  return historySerializer(this);
};

function messageSerializer(message) {
  return `${message.role.toUpperCase()}: ${message.content}</s>`;
}

function historySerializer(history) {
  return history.map(messageSerializer).join("\n");
}

const $history = document.querySelector("#chat-history");

const $input = document.querySelector("#chat-message");

const $form = document.querySelector("#message-form");
$form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (responding) {
    return;
  }

  const question = $input.value;
  appendUserMsg(question);

  const prompt = toPrompt({ chatHistory, question });
  chatHistory.push({
    role: "user",
    content: question,
  });

  $input.value = "";

  generateCompletion(prompt, chatHistory);
});

function appendMsg(msg, toComponent) {
  const $newMsg = document.createElement("template");
  $newMsg.innerHTML = toComponent({
    message: msg,
    time: new Date().toLocaleTimeString(),
  });

  $history.appendChild($newMsg.content);

  scrollToBottomMsg();
}

function appendUserMsg(msg) {
  appendMsg(msg, toUserComponent);
}

function appendAIMsg(msg) {
  appendMsg(msg, toAIComponent);
}

function scrollToBottomMsg() {
  $history.querySelector(".message:last-child").scrollIntoView();
}
