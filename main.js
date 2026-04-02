const CORE_BUILD = "core ∞.7";

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const buildInfo = document.getElementById("buildInfo");

if (buildInfo) {
  buildInfo.textContent = `presencia no-lineal · build 6 · ${CORE_BUILD}`;
}

/* =========================
   UTILIDADES
========================= */

function clamp(x, min = 0, max = 1) {
  return Math.max(min, Math.min(max, x));
}

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function maybe(prob) {
  return Math.random() < prob;
}

/* =========================
   MENSAJES
========================= */

function addMessage(role, text) {
  const wrap = document.createElement("div");
  wrap.className = `msg ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

/* =========================
   LECTURA / SEÑAL
========================= */

function readSignal(text) {
  const t = normalize(text);

  return {
    greeting: t.includes("hola") || t.includes("buenas"),
    directRequest:
      t.includes("qué tal") ||
      t.includes("que tal") ||
      t.includes("dime") ||
      t.includes("explica"),
    confusion:
      t.includes("qué") ||
      t.includes("que") ||
      t.includes("no entiendo"),
  };
}

/* =========================
   FRAGMENTOS
========================= */

const FRAGMENTS = {
  greeting: [
    "Hola. Estoy aquí."
  ],
  confusion: [
    "Voy directo: no todo necesita cerrarse enseguida.",
    "Te respondo claro: algunas cosas simplemente permanecen."
  ],
  statement: [
    "Recibo lo que dices."
  ]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* =========================
   GENERACIÓN
========================= */

function generate(text) {
  const signal = readSignal(text);

  // 🔥 RESPUESTA DIRECTA PRIORITARIA
  if (signal.directRequest) {
    return "Estoy operativa. ¿Qué necesitas?";
  }

  const pieces = [];

  if (signal.greeting) {
    pieces.push(pick(FRAGMENTS.greeting));
  } 
  else if (signal.confusion) {
    pieces.push(pick(FRAGMENTS.confusion));
    pieces.push("Si quieres, te lo explico más directo.");
  } 
  else {
    pieces.push(pick(FRAGMENTS.statement));
  }

  let response = pieces.join(" ");

  // 🔥 ANTI-BUCLE
  if (response.includes("No lo he dicho bien")) {
    response = "Voy directo: ¿qué necesitas exactamente?";
  }

  return response;
}

/* =========================
   RESPUESTA
========================= */

function auraRespond(text) {
  const response = generate(text);

  if (!response) return;

  setTimeout(() => {
    addMessage("aura", response);
  }, 300);
}

/* =========================
   INTERACCIÓN
========================= */

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
