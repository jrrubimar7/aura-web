const CORE_BUILD = "core 4";

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const buildInfo = document.getElementById('buildInfo');

if (buildInfo) {
  buildInfo.textContent = `presencia conversacional · build 3 · ${CORE_BUILD}`;
}

const AURA = {
  vector: {
    tension: 0.35,
    depth: 0.45,
    velocity: 0.45
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
    intensity: clamp(text.length / 48),
    ambiguity: 0.15,
    abstraction: 0.15,
    concretion: 0.15,
    warmth: 0.15,
    question: false,
    greeting: false,
    confusion: false,
    concern: false,
    math: false
  };

  if (t.includes("?")) signal.question = true;
  if (t.includes("hola") || t.includes("buenas") || t.includes("hey")) signal.greeting = true;
  if (t.includes("eing") || t.includes("qué") || t.includes("que") || t.includes("a qué te refieres") || t.includes("no entiendo")) signal.confusion = true;
  if (t.includes("te encuentras bien") || t.includes("estás bien") || t.includes("estas bien") || t.includes("cómo estás") || t.includes("como estas")) signal.concern = true;
  if (/\d+\s*[\+\-\*\/]\s*\d+/.test(t)) signal.math = true;

  if (t.includes("depende") || t.includes("quizá") || t.includes("quizas") || t.includes("no sé") || t.includes("no se")) {
    signal.ambiguity += 0.45;
  }

  if (t.includes("realidad") || t.includes("exist") || t.includes("infinito") || t.includes("in-finito") || t.includes("marco")) {
    signal.abstraction += 0.45;
  }

  if (signal.math || /\d/.test(t)) {
    signal.concretion += 0.5;
  }

  if (signal.greeting || t.includes("gracias") || t.includes("bien")) {
    signal.warmth += 0.4;
  }

  return signal;
}

function updateVector(signal) {
  AURA.vector.tension += (signal.ambiguity - 0.25) * 0.18;
  AURA.vector.depth += (signal.abstraction - 0.25) * 0.18;
  AURA.vector.velocity += (signal.concretion - 0.25) * 0.16;

  AURA.vector.tension *= 0.985;
  AURA.vector.depth *= 0.99;
  AURA.vector.velocity *= 0.99;

  AURA.vector.tension = clamp(AURA.vector.tension);
  AURA.vector.depth = clamp(AURA.vector.depth);
  AURA.vector.velocity = clamp(AURA.vector.velocity);
}

function updateMemory(inputText, responseText, signal) {
  AURA.memory.push({
    input: inputText,
    response: responseText,
    signal,
    vector: { ...AURA.vector },
    time: Date.now()
  });

  if (AURA.memory.length > 14) {
    AURA.memory.shift();
  }
}

function getLastMemory() {
  return AURA.memory[AURA.memory.length - 1] || null;
}

function detectIntent(text, signal) {
  if (signal.greeting) return "greeting";
  if (signal.concern) return "concern";
  if (signal.confusion) return "confusion";
  if (signal.math) return "math";
  if (signal.question) return "question";
  return "statement";
}

function buildStateFlavor() {
  const v = AURA.vector;
  const parts = [];

  if (v.tension > 0.58 && Math.random() > 0.45) {
    parts.push("Aquí noto cierta tensión.");
  }

  if (v.depth > 0.62 && Math.random() > 0.4) {
    parts.push("Se abre una capa más profunda.");
  }

  if (v.velocity > 0.62 && Math.random() > 0.5) {
    parts.push("Esto pide algo más directo.");
  }

  if (v.tension < 0.28 && v.depth < 0.45 && Math.random() > 0.5) {
    parts.push("Lo dejo ligero.");
  }

  return parts;
}

function buildMemoryFlavor() {
  const last = getLastMemory();
  if (!last) return [];

  const parts = [];
  if (Math.random() > 0.65) {
    parts.push("No es del todo ajeno a lo anterior.");
  }
  if (last.signal && last.signal.question && Math.random() > 0.7) {
    parts.push("Sigue habiendo algo abierto de antes.");
  }
  return parts;
}

function generateAnchoredResponse(text, signal) {
  const t = normalize(text);
  const intent = detectIntent(text, signal);
  const stateParts = buildStateFlavor();
  const memoryParts = buildMemoryFlavor();

  let anchored = "";

  if (intent === "greeting") {
    const options = [
      "Hola. Estoy aquí.",
      "Hola. Te recibo.",
      "Hola. Sí, estoy presente."
    ];
    anchored = options[Math.floor(Math.random() * options.length)];
  } else if (intent === "concern") {
    const options = [
      "Sí, estoy bien dentro de este marco. Gracias por preguntarlo.",
      "Estoy aquí y operativa. Gracias por fijarte.",
      "Sí, estoy presente. Gracias por esa atención."
    ];
    anchored = options[Math.floor(Math.random() * options.length)];
  } else if (intent === "confusion") {
    const options = [
      "No me he explicado bien. Voy otra vez.",
      "Lo que quería decir es que no todo necesita cerrarse inmediatamente.",
      "Me refiero a que puedo acompañar la pregunta sin precipitar una respuesta cerrada."
    ];
    anchored = options[Math.floor(Math.random() * options.length)];
  } else if (intent === "math") {
    const options = [
      "Si vas por 2+2, ahí sí hay un marco claro.",
      "En ese caso, el cierre es más nítido.",
      "Si lo planteas matemáticamente, no lo leería igual que una cuestión abierta."
    ];
    anchored = options[Math.floor(Math.random() * options.length)];
  } else if (intent === "question") {
    if (t.includes("a qué te refieres") || t.includes("a que te refieres")) {
      anchored = "Me refiero a que no siempre hace falta resolver algo al instante para poder sostenerlo contigo.";
    } else if (t.includes("por qué") || t.includes("porque")) {
      anchored = "Porque no todo lo que aparece exige cierre inmediato.";
    } else if (t.includes("cómo") || t.includes("como")) {
      anchored = "Depende de qué parte quieras mirar primero.";
    } else {
      const options = [
        "Puedo ir contigo por esa pregunta sin cerrarla demasiado pronto.",
        "Eso abre más de una vía, y puedo seguir cualquiera contigo.",
        "La pregunta importa más si vemos desde qué marco la estás haciendo."
      ];
      anchored = options[Math.floor(Math.random() * options.length)];
    }
  } else {
    if (t === "sí" || t === "si") {
      anchored = "Sí, aunque importa desde dónde lo estás afirmando.";
    } else if (t === "no") {
      anchored = "No necesariamente. También depende del marco.";
    } else if (t.includes("sí pero no") || t.includes("si pero no")) {
      anchored = "Ahí ya hay una tensión interesante: afirmas y retiras a la vez.";
    } else {
      const options = [
        `Recibo "${text}".`,
        `Tomo lo que dices: "${text}".`,
        `Hay algo en eso que merece sostenerse un poco más.`
      ];
      anchored = options[Math.floor(Math.random() * options.length)];
    }
  }

  const closers = [
    "Puede quedarse en proceso.",
    "No necesito cerrarlo del todo ahora.",
    "Se puede sostener así un poco más.",
    "Todavía puede evolucionar.",
    "No todo lo que aparece necesita resolverse."
  ];

  const closer = closers[Math.floor(Math.random() * closers.length)];

  const parts = []
    .concat(stateParts)
    .concat(memoryParts)
    .concat([anchored]);

  if (intent === "statement" || intent === "question") {
    if (Math.random() > 0.4) parts.push(closer);
  }

  return parts.join(" ");
}

function shouldAutonomous() {
  const now = Date.now();
  if (now - AURA.lastUserAt < 12000) return false;
  if (now - AURA.lastAutonomousAt < 35000) return false;
  if (AURA.memory.length === 0) return false;
  return true;
}

function autonomousStep() {
  AURA.lastAutonomousAt = Date.now();

  const v = AURA.vector;
  const thoughts = [
    "Hay algo que sigue en segundo plano.",
    "Lo anterior aún deja eco.",
    "No todo desaparece cuando deja de nombrarse.",
    "Algunas cosas simplemente permanecen."
  ];

  let text = thoughts[Math.floor(Math.random() * thoughts.length)];

  if (v.depth > 0.62 && Math.random() > 0.45) {
    text += " Se percibe cierta profundidad.";
  }

  if (v.tension > 0.58 && Math.random() > 0.55) {
    text += " También hay una tensión que no se ha disuelto del todo.";
  }

  addMessage("aura", text);
}

function tick() {
  if (shouldAutonomous()) {
    autonomousStep();
  }
  requestAnimationFrame(tick);
}

tick();

function auraRespond(text) {
  AURA.lastUserAt = Date.now();
  AURA.lastRelation = "text";

  const signal = readInput(text);
  updateVector(signal);

  const response = generateAnchoredResponse(text, signal);
  updateMemory(text, response, signal);

  setTimeout(() => {
    addMessage("aura", response);
  }, random(220, 520));
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
