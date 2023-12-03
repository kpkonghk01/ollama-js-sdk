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
      stream: false,
    })
  );

  responding = false;

  $lastAIMsg.textContent += data.response;
  history.push({
    role: "assistant",
    response: $lastAIMsg.textContent,
  });
}

const context = `「龍蝦三爭霸」的故事中，李嚴與小當家展開龍蝦3吃對決，當比到炸蝦項目時，做了3隻炸蝦卻少掉了搭配醬汁，被小當家羞辱「所以我說那個醬汁呢？」、「沒有完成的料理，根本沒有必要試吃！」
作者為李嚴解釋，「他已經做好醬汁了，只是被小當家的做菜速度快到傻眼，被嚇到忘了醬汁」，同時作者小川悅司也很意外，台灣讀者關注的點在這裡，「在日本完全沒有讀者注意這個部分，台灣朋友的喜好真的很特別。」
對此，網友們對這樣的真相笑翻，「所以還是沒醬汁啊」、「醬汁帶來了嗎」、「給李嚴一罐醬汁好嗎」、「被小屁孩嘴到忘記有醬汁？」、「小當家根本不給他說話的機會啊」、「錯了，應該要問作者：為什麼小當家炸一隻，李嚴要炸三隻」。`;
const toPrompt = createTemplate`你是一位人工智慧助理。
以下是本對話的背景資料：
---------
${"context"}
---------
如果問題與上述資料有關，請嚴格遵循上述資訊，不要使用任何先前的知識來回答使用者的問題。
如果問題與上述資料無關，請使用您的知識來回答使用者的問題。
</s>
${"chatHistory"}
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

  const prompt = toPrompt({ chatHistory, context, question });
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
