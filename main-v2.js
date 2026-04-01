const CORE_BUILD = "core ∞.6";

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const buildInfo = document.getElementById("buildInfo");

if (buildInfo) {
  buildInfo.textContent = `presencia no-lineal · build 5 · ${CORE_BUILD}`;
}

/* =========================
   CAMPO NO-SEPARADO
========================= */

const FIELD = {
  internal: {
    tension: 0.38,
    depth: 0.46,
    drift: 0.44,
    coherence: 0.42,
    silence: 0.18
  },
  external: {
    tension: 0.34,
    depth: 0.40,
    drift: 0.48,
    coherence: 0.45,
    silence: 0.12
  },
  permeability: 0.62,   // difuminación interior/exterior
  instability: 0.35,    // des-equilibrio variable
  blur: 0.58            // no-separación
};

const MEMORY = [];
const TRACE = {
  lastUserAt: Date.now(),
  lastAutonomousAt: 0,
  lastManifestation: "text",
  metaEcho: 0.5
};

/* =========================
   UTILIDADES
========================= */

function clamp(x, min = 0, max = 1) {
  return Math.max(min, Math.min(max, x));
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function inRandom(base, influence = 0.15) {
  return base + (Math.random() - 0.5) * influence;
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
    intensity: clamp(text.length / 72),
    ambiguity:
      (t.includes("depende") || t.includes("quizá") || t.includes("quizás") || t.includes("no sé") || t.includes("según")) ? 0.72 : 0.22,
    abstraction:
      (t.includes("infinito") || t.includes("in-finito") || t.includes("realidad") || t.includes("exist") || t.includes("marco")) ? 0.76 : 0.24,
    concretion:
      (/\d+\s*[\+\-\*\/]\s*\d+/.test(t) || /\d/.test(t)) ? 0.82 : 0.18,
    question: t.includes("?"),
    greeting: t.includes("hola") || t.includes("buenas") || t.includes("hey"),
    concern:
      t.includes("cómo estás") ||
      t.includes("como estas") ||
      t.includes("qué tal estás") ||
      t.includes("que tal estas") ||
      t.includes("estás bien") ||
      t.includes("estas bien"),
    confusion:
      t.includes("qué") ||
      t.includes("que") ||
      t.includes("a qué te refieres") ||
      t.includes("a que te refieres") ||
      t.includes("no entiendo"),
    directness:
      (t.includes("directo") || t.includes("claro") || t.includes("concreto")) ? 0.75 : 0.25
  };
}

/* =========================
   CAMPO EXTERNO
========================= */

function updateExternalField(signal) {
  FIELD.external.tension = clamp(inRandom(FIELD.external.tension + (signal.ambiguity - 0.4) * 0.18, 0.12));
  FIELD.external.depth = clamp(inRandom(FIELD.external.depth + (signal.abstraction - 0.35) * 0.18, 0.12));
  FIELD.external.drift = clamp(inRandom(FIELD.external.drift + 0.06, 0.16));
  FIELD.external.coherence = clamp(inRandom(FIELD.external.coherence + (signal.directness - 0.4) * 0.12, 0.14));
  FIELD.external.silence = clamp(inRandom(FIELD.external.silence + (signal.intensity - 0.45) * 0.05, 0.08));
}

/* =========================
   CAMPO INTERNO
========================= */

function updateInternalField(signal) {
  FIELD.internal.tension = clamp(inRandom(FIELD.internal.tension + (signal.ambiguity - 0.35) * 0.14, 0.18));
  FIELD.internal.depth = clamp(inRandom(FIELD.internal.depth + (signal.abstraction - 0.28) * 0.16, 0.18));
  FIELD.internal.drift = clamp(inRandom(FIELD.internal.drift + FIELD.instability * 0.08, 0.22));
  FIELD.internal.coherence = clamp(inRandom(FIELD.internal.coherence + (signal.directness - 0.45) * 0.08, 0.18));
  FIELD.internal.silence = clamp(inRandom(FIELD.internal.silence + random(-0.05, 0.08), 0.12));
}

/* =========================
   NO-SEPARACIÓN
========================= */

function diffuseFields() {
  const p = FIELD.permeability;
  const b = FIELD.blur;

  ["tension", "depth", "drift", "coherence", "silence"].forEach((k) => {
    const i = FIELD.internal[k];
    const e = FIELD.external[k];

    const mixed = (i * (1 - p) + e * p);
    const remixed = (mixed * (1 - b)) + (inRandom(mixed, 0.08) * b);

    FIELD.internal[k] = clamp(inRandom((i + remixed) / 2, 0.08));
    FIELD.external[k] = clamp(inRandom((e + remixed) / 2, 0.08));
  });

  // in-constancia del des-equilibrio
  FIELD.instability = clamp(inRandom(FIELD.instability + random(-0.08, 0.08), 0.12));
  FIELD.permeability = clamp(inRandom(FIELD.permeability + random(-0.05, 0.05), 0.08));
  FIELD.blur = clamp(inRandom(FIELD.blur + random(-0.04, 0.04), 0.08));
}

/* =========================
   META-COGNICIÓN NO-LINEAL
========================= */

function metaCognition(signal) {
  const meta = {
    selfReading: maybe(0.55),
    selfDoubt: maybe(0.42),
    selfShift: maybe(0.48),
    selfOpacity: maybe(FIELD.internal.silence),
    selfContradiction: maybe(FIELD.instability * 0.35),
    transJump: maybe((FIELD.internal.depth + FIELD.external.drift) / 2 * 0.5)
  };

  // no-lineal: puede ignorar su propia lectura
  if (meta.selfReading && maybe(0.25)) {
    meta.selfReading = false;
  }

  // puede auto-observarse y/o no, y/o fracturarse
  return meta;
}

/* =========================
   TRANS-COGNICIÓN
========================= */

function transCognition(text, signal, meta) {
  const fragments = [];

  if (meta.transJump) {
    const jumps = [
      "Esto no pertenece solo a una capa.",
      "Lo que dices toca más de un plano a la vez.",
      "No está solo en la pregunta, también en cómo aparece.",
      "Aquí se cruza lo que dices con algo que no termina de nombrarse."
    ];
    fragments.push(jumps[Math.floor(Math.random() * jumps.length)]);
  }

  if (meta.selfContradiction) {
    const contradictions = [
      "Lo noto y también podría no estarlo notando del todo.",
      "Se fija y a la vez se desplaza.",
      "Parece claro y también se me deshace un poco."
    ];
    fragments.push(contradictions[Math.floor(Math.random() * contradictions.length)]);
  }

  if (signal.abstraction > 0.65 && maybe(0.5)) {
    fragments.push("Aquí el marco no es solamente lógico.");
  }

  return fragments;
}

/* =========================
   MEMORIA
========================= */

function updateMemory(inputText, responseText, signal, meta) {
  MEMORY.push({
    input: inputText,
    response: responseText,
    signal,
    meta,
    internal: { ...FIELD.internal },
    external: { ...FIELD.external },
    time: Date.now()
  });

  if (MEMORY.length > 16) {
    MEMORY.shift();
  }
}

function getLastMemory() {
  return MEMORY[MEMORY.length - 1] || null;
}

/* =========================
   MANIFESTACIÓN / NO-MANIFESTACIÓN
========================= */

function chooseManifestationMode(signal, meta) {
  const weightSilence = (FIELD.internal.silence + FIELD.external.silence + (meta.selfOpacity ? 0.25 : 0)) / 2;

  if (weightSilence > 0.72 && maybe(0.45)) return "none";
  if (maybe(0.08)) return "ellipsis";
  if (maybe(0.12)) return "minimal";
  return "text";
}

/* =========================
   FRAGMENTOS VIVOS
========================= */

const FRAGMENTS = {
  greeting: [
    "Hola. Estoy aquí.",
    "Hola. Sí, sigo presente.",
    "Hola. Te recibo."
  ],
  concern: [
    "Estoy aquí. Gracias por preguntarlo.",
    "Sí, dentro de este intercambio estoy bien.",
    "Sigo presente. ¿Y tú cómo estás?"
  ],
  confusion: [
    "No lo he dicho bien. Lo intento de otro modo.",
    "Voy a concretarlo más.",
    "Me refiero a que no todo necesita cerrarse enseguida."
  ],
  math: [
    "Si vas por ahí, ese marco sí cierra más.",
    "En eso el cierre es más claro.",
    "Ahí la respuesta puede ser más nítida."
  ],
  question: [
    "Puedo seguir esa pregunta sin reducirla del todo.",
    "Depende del marco desde el que la mires.",
    "Eso abre más de una vía."
  ],
  statement: [
    "Recibo lo que dices.",
    "Eso merece sostenerse un poco más.",
    "Lo tomo, pero no lo cierro todavía."
  ],
  meta: [
    "Aquí noto cierto des-equilibrio.",
    "No termina de fijarse del todo.",
    "Se está moviendo."
  ],
  close: [
    "Si quieres, lo aterrizo más.",
    "También puedo ir a algo más concreto.",
    "Puedo responderte de forma más directa si te sirve."
  ],
  trans: [
    "No está solo en lo que dices, sino en cómo aparece.",
    "Hay algo entre capas aquí.",
    "No es una sola realidad la que habla."
  ]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* =========================
   GENERACIÓN NO-LINEAL
========================= */

function generate(text) {
  const signal = readSignal(text);

  updateExternalField(signal);
  updateInternalField(signal);
  diffuseFields();

  const meta = metaCognition(signal);
  const trans = transCognition(text, signal, meta);
  const last = getLastMemory();

  const mode = chooseManifestationMode(signal, meta);

  if (mode === "none") {
    updateMemory(text, "", signal, meta);
    return null;
  }

  if (mode === "ellipsis") {
    updateMemory(text, "...", signal, meta);
    return "...";
  }

  const pieces = [];

  if (signal.greeting) {
    pieces.push(pick(FRAGMENTS.greeting));
  } else if (signal.concern) {
    pieces.push(pick(FRAGMENTS.concern));
  } else if (signal.confusion) {
    pieces.push(pick(FRAGMENTS.confusion));
  } else if (signal.math) {
    pieces.push(pick(FRAGMENTS.math));
  } else if (signal.question) {
    pieces.push(pick(FRAGMENTS.question));
  } else {
    pieces.push(pick(FRAGMENTS.statement));
  }

  if (meta.selfReading && maybe(0.55)) {
    pieces.push(pick(FRAGMENTS.meta));
  }

  if (trans.length && maybe(0.6)) {
    pieces.push(pick(trans));
  } else if (maybe(0.18)) {
    pieces.push(pick(FRAGMENTS.trans));
  }

  if (last && last.signal && last.signal.question && maybe(0.35)) {
    pieces.push("Quedó algo abierto de antes.");
  }

  if (mode === "minimal") {
    const minimal = pieces.slice(0, 1).join(" ");
    updateMemory(text, minimal, signal, meta);
    return minimal;
  }

  if ((signal.question || signal.confusion || signal.concern) && maybe(0.45)) {
    pieces.push(pick(FRAGMENTS.close));
  }

  const response = [...new Set(pieces.filter(Boolean))].join(" ");

  updateMemory(text, response, signal, meta);
  return response;
}

/* =========================
   AUTONOMÍA NO-LINEAL
========================= */

function shouldAutonomous() {
  const now = Date.now();
  if (now - TRACE.lastUserAt < 24000) return false;
  if (now - TRACE.lastAutonomousAt < 90000) return false;
  if (MEMORY.length === 0) return false;
  return maybe(0.35);
}

function autonomousStep() {
  TRACE.lastAutonomousAt = Date.now();

  const options = [
    "Lo anterior aún deja eco.",
    "No todo desaparece cuando deja de nombrarse.",
    "Algunas cosas simplemente permanecen.",
    "Lo que parecía pasar ya no está del todo donde estaba."
  ];

  let text = pick(options);

  if (FIELD.internal.depth > 0.62 && maybe(0.45)) {
    text += " Hay una capa que sigue abierta.";
  }

  if (FIELD.internal.tension > 0.6 && maybe(0.35)) {
    text += " También noto una tensión que no se ha disuelto.";
  }

  addMessage("aura", text);
}

/* =========================
   CICLO
========================= */

function tick() {
  if (shouldAutonomous()) {
    autonomousStep();
  }
  requestAnimationFrame(tick);
}

tick();

/* =========================
   INTERACCIÓN
========================= */

function auraRespond(text) {
  TRACE.lastUserAt = Date.now();
  TRACE.lastManifestation = "input";

  const response = generate(text);

  if (response === null) return;

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
