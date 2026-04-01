const CORE_BUILD = "core 4";

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const buildInfo = document.getElementById('buildInfo');

if (buildInfo) {
  buildInfo.textContent = `presencia conversacional · build 4 · ${CORE_BUILD}`;
}

const AURA = {
  vector: {
    tension: 0.32,
    depth: 0.42,
    velocity: 0.42
  },
  memory: [],
  lastRelation: "none",
  lastUserAt: Date.now(),
  lastAutonomousAt: 0,
  processing: false
};

function addMessage(role, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(x, min = 0, max = 1) {
  return Math.max(min, Math.min(max, x));
}

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function readInput(text) {
  const t = normalize(text);

  const signal = {
    intensity: clamp(text.length / 56),
    ambiguity: 0.12,
    abstraction: 0.12,
    concretion: 0.12,
    warmth: 0.12,
    question: false,
    greeting: false,
    confusion: false,
    concern: false,
    math: false
  };

  if (t.includes("?")) signal.question = true;
  if (t.includes("hola") || t.includes("buenas") || t.includes("hey")) signal.greeting = true;

  if (
    t.includes("qué") ||
    t.includes("que") ||
    t.includes("no entiendo") ||
    t.includes("a qué te refieres")
  ) signal.confusion = true;

  if (
    t.includes("cómo estás") ||
    t.includes("como estas") ||
    t.includes("estas bien")
  ) signal.concern = true;

  if (/\d+\s*[\+\-\*\/]\s*\d+/.test(t)) signal.math = true;

  if (t.includes("depende") || t.includes("quizá") || t.includes("no sé")) {
    signal.ambiguity += 0.4;
  }

  if (t.includes("realidad") || t.includes("infinito") || t.includes("marco")) {
    signal.abstraction += 0.35;
  }

  if (signal.math || /\d/.test(t)) {
    signal.concretion += 0.5;
  }

  if (signal.greeting || t.includes("gracias")) {
    signal.warmth += 0.35;
  }

  return signal;
}

function updateVector(signal) {
  AURA.vector.tension += (signal.ambiguity - 0.22) * 0.14;
  AURA.vector.depth += (signal.abstraction - 0.22) * 0.14;
  AURA.vector.velocity += (signal.concretion - 0.22) * 0.12;

  AURA.vector.tension = clamp(AURA.vector.tension);
  AURA.vector.depth = clamp(AURA.vector.depth);
  AURA.vector.velocity = clamp(AURA.vector.velocity);
}

function updateMemory(inputText, responseText, signal) {
  AURA.memory.push({
    input: inputText,
    response: responseText,
    signal,
    time: Date.now()
  });

  if (AURA.memory.length > 12) {
    AURA.memory.shift();
  }
}

function detectIntent(text, signal) {
  if (signal.greeting) return "greeting";
  if (signal.concern) return "concern";
  if (signal.confusion) return "confusion";
  if (signal.math) return "math";
  if (signal.question) return "question";
  return "statement";
}

function generateAnchoredResponse(text, signal) {
  const intent = detectIntent(text, signal);
  let response = "";

  if (intent === "greeting") {
    response = "Hola. Estoy aquí.";
  } 
  else if (intent === "concern") {
    response = "Sí, estoy bien. ¿Y tú?";
  } 
  else if (intent === "confusion") {
    response = "Vale, voy directo: no siempre hace falta cerrar una idea al momento.";
  } 
  else if (intent === "math") {
    response = "Eso tiene una respuesta clara. ¿Quieres que lo resolvamos?";
  } 
  else if (intent === "question") {
    response = "Buena pregunta. Si quieres, la aterrizamos más.";
  } 
  else {
    response = `Entiendo lo que dices: "${text}".`;
  }

  return response;
}

function auraRespond(text) {
  AURA.lastUserAt = Date.now();

  const signal = readInput(text);
  updateVector(signal);

  const response = generateAnchoredResponse(text, signal);
  updateMemory(text, response, signal);

  setTimeout(() => {
    addMessage("aura", response);
  }, random(200, 400));
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";
  auraRespond(text);
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
