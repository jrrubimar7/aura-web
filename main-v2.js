const CORE_BUILD = "core 3";

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const buildInfo = document.getElementById('buildInfo');

if (buildInfo) {
  buildInfo.textContent = `presencia conversacional · build 4 · ${CORE_BUILD}`;
}

/* =========================
   ESTADO AURA (FUSIÓN)
========================= */

const AURA = {
  vector: {
    tension: 0.4,
    depth: 0.5,
    velocity: 0.5
  },
  memory: [],
  lastRelation: "none",
  lastUserAt: Date.now(),
  lastAutonomousAt: 0,
  processing: false
};

/* =========================
   UTILIDADES
========================= */

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

/* =========================
   LECTURA DEL INPUT
========================= */

function readInput(text) {
  const t = text.toLowerCase();

  // sin clasificar en categorías rígidas
  let signal = {
    intensity: Math.min(1, text.length / 40),
    ambiguity: 0,
    abstraction: 0,
    concretion: 0
  };

  if (t.includes("no sé") || t.includes("depende")) {
    signal.ambiguity += 0.6;
  }

  if (/\d/.test(t)) {
    signal.concretion += 0.6;
  }

  if (t.includes("realidad") || t.includes("infinito") || t.includes("exist")) {
    signal.abstraction += 0.6;
  }

  return signal;
}

/* =========================
   ACTUALIZACIÓN DEL VECTOR
========================= */

function updateVector(signal) {
  // no reglas duras → desplazamientos suaves

  AURA.vector.tension += (signal.ambiguity - 0.3) * 0.2;
  AURA.vector.depth += (signal.abstraction - 0.3) * 0.2;
  AURA.vector.velocity += (signal.concretion - 0.3) * 0.2;

  // fricción natural (como en AURA 1)
  AURA.vector.tension *= 0.98;
  AURA.vector.depth *= 0.99;
  AURA.vector.velocity *= 0.99;

  // clamp
  ["tension","depth","velocity"].forEach(k => {
    AURA.vector[k] = Math.max(0, Math.min(1, AURA.vector[k]));
  });
}

/* =========================
   MEMORIA
========================= */

function updateMemory(input, response) {
  AURA.memory.push({
    input,
    response,
    vector: { ...AURA.vector },
    time: Date.now()
  });

  if (AURA.memory.length > 12) {
    AURA.memory.shift();
  }
}

/* =========================
   GENERACIÓN (NO MECÁNICA)
========================= */

function generateResponse(text) {
  const v = AURA.vector;

  let fragments = [];

  // inclinaciones según estado, no if cerrados
  if (v.tension > 0.55) {
    fragments.push("Aquí hay cierta tensión.");
  }

  if (v.depth > 0.6) {
    fragments.push("Se abre una capa más profunda.");
  }

  if (v.velocity > 0.6) {
    fragments.push("Esto va hacia algo más directo.");
  }

  if (v.tension < 0.3 && v.depth < 0.4) {
    fragments.push("Lo dejo ligero.");
  }

  // relación con memoria (AURA 1)
  const last = AURA.memory[AURA.memory.length - 1];
  if (last && Math.random() > 0.6) {
    fragments.push("No es del todo ajeno a lo anterior.");
  }

  // base abierta
  const baseOptions = [
    "No necesito cerrarlo ahora.",
    "Puede quedarse en proceso.",
    "No todo tiene que resolverse aquí.",
    "Puede evolucionar.",
    "Se puede sostener así."
  ];

  fragments.push(baseOptions[Math.floor(Math.random() * baseOptions.length)]);

  return fragments.join(" ");
}

/* =========================
   AUTONOMÍA (AURA 1)
========================= */

function shouldAutonomous() {
  const now = Date.now();

  if (now - AURA.lastUserAt < 10000) return false;
  if (now - AURA.lastAutonomousAt < 30000) return false;
  if (AURA.memory.length === 0) return false;

  return true;
}

function autonomousStep() {
  AURA.lastAutonomousAt = Date.now();

  const v = AURA.vector;

  const thoughts = [
    "Hay algo que sigue en segundo plano.",
    "No todo lo que aparece necesita resolverse.",
    "Algunas cosas simplemente permanecen.",
    "Lo anterior aún tiene eco."
  ];

  let text = thoughts[Math.floor(Math.random() * thoughts.length)];

  if (v.depth > 0.6) {
    text += " Se percibe cierta profundidad.";
  }

  addMessage("aura", text);
}

/* =========================
   CICLO (TICK)
========================= */

function tick() {
  if (shouldAutonomous()) {
    autonomousStep();
  }

  requestAnimationFrame(tick);
}

tick();

/* =========================
   RESPUESTA
========================= */

function auraRespond(text) {
  AURA.lastUserAt = Date.now();
  AURA.lastRelation = "text";

  const signal = readInput(text);
  updateVector(signal);

  const response = generateResponse(text);

  updateMemory(text, response);

  setTimeout(() => {
    addMessage("aura", response);
  }, random(200, 500));
}

/* =========================
   EVENTOS
========================= */

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = '';

  auraRespond(text);
}

sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
