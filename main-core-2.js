const CORE_BUILD = "core 2";

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const buildInfo = document.getElementById('buildInfo');

if (buildInfo) {
  buildInfo.textContent = `presencia conversacional · build 3 · ${CORE_BUILD}`;
}

let memory = [];

let aura = {
  tendencia: "abierta",
  ultimoMarco: "abierto",
  ultimaRealidad: "indeterminada",
  tensionActiva: false,
  intensidad: 0.5,
  memoriaActiva: [],
  estadoInterno: "receptiva",
  visibilidadInterna: "sutil"
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

function detectMode(userText) {
  const text = userText.toLowerCase();

  if (/\d+\s*[\+\-\*\/]\s*\d+/.test(text)) {
    return "matematico";
  }

  const absoluteWords = [
    "siempre", "nunca", "absoluto", "seguro", "exacto", "definitivo", "100%"
  ];

  const relativeWords = [
    "depende", "según", "relativo", "perspectiva", "contexto", "puede", "quizás"
  ];

  const nullWords = [
    "nulo", "vacío", "espacio", "tiempo", "indefinido", "sin sentido", "no sé"
  ];

  if (absoluteWords.some(word => text.includes(word))) return "absoluto";
  if (relativeWords.some(word => text.includes(word))) return "relativo";
  if (nullWords.some(word => text.includes(word))) return "nulo";

  return "abierto";
}

function detectRealityType(userText, mode) {
  const text = userText.toLowerCase();

  if (mode === "matematico") return "matematica";

  const perceptiveWords = [
    "parece", "percibo", "siento", "veo", "mirada", "observador", "percepción"
  ];

  const linguisticWords = [
    "lenguaje", "palabra", "significa", "decir", "frase", "concepto", "nombre"
  ];

  const conceptualWords = [
    "realidad", "verdad", "ética", "infinito", "in-finito", "existencia", "marco", "filosof"
  ];

  if (perceptiveWords.some(word => text.includes(word))) return "perceptiva";
  if (linguisticWords.some(word => text.includes(word))) return "linguistica";
  if (conceptualWords.some(word => text.includes(word))) return "conceptual";
  if (mode === "absoluto" || mode === "relativo" || mode === "nulo") return "contextual";

  return "indeterminada";
}

function updateMemory(userText, mode, realityType) {
  memory.push(userText);

  aura.memoriaActiva.push({
    texto: userText,
    marco: mode,
    realidad: realityType
  });

  if (aura.memoriaActiva.length > 6) {
    aura.memoriaActiva.shift();
  }
}

function detectTension(currentMode, currentReality) {
  const lastItem = aura.memoriaActiva[aura.memoriaActiva.length - 2];
  if (!lastItem) return false;
  return lastItem.marco !== currentMode || lastItem.realidad !== currentReality;
}

function updateTendencia(currentMode) {
  if (currentMode === "matematico" || currentMode === "absoluto") {
    aura.tendencia = "firme";
    aura.intensidad = Math.min(1, aura.intensidad + 0.15);
    return;
  }

  if (currentMode === "relativo") {
    aura.tendencia = "exploratoria";
    aura.intensidad = Math.min(1, aura.intensidad + 0.1);
    return;
  }

  if (currentMode === "nulo") {
    aura.tendencia = "suspendida";
    aura.intensidad = Math.min(1, aura.intensidad + 0.1);
    return;
  }

  aura.tendencia = "abierta";
  aura.intensidad = Math.max(0.3, aura.intensidad - 0.05);
}

function updateEstadoInterno() {
  if (aura.tensionActiva) {
    aura.estadoInterno = "tensionada";
    return;
  }

  if (aura.tendencia === "firme") {
    aura.estadoInterno = "firme";
    return;
  }

  if (aura.tendencia === "exploratoria") {
    aura.estadoInterno = "exploratoria";
    return;
  }

  if (aura.tendencia === "suspendida") {
    aura.estadoInterno = "suspendida";
    return;
  }

  aura.estadoInterno = "receptiva";
}

function resolveVisibilidad() {
  const r = Math.random();

  if (aura.estadoInterno === "tensionada") {
    if (r < 0.25) return "nula";
    if (r < 0.55) return "sutil";
    if (r < 0.8) return "semi";
    return "explicita";
  }

  if (aura.estadoInterno === "firme") {
    if (r < 0.4) return "nula";
    if (r < 0.75) return "sutil";
    if (r < 0.9) return "semi";
    return "explicita";
  }

  if (aura.estadoInterno === "exploratoria") {
    if (r < 0.2) return "nula";
    if (r < 0.45) return "sutil";
    if (r < 0.75) return "semi";
    return "explicita";
  }

  if (aura.estadoInterno === "suspendida") {
    if (r < 0.35) return "nula";
    if (r < 0.65) return "sutil";
    if (r < 0.9) return "semi";
    return "explicita";
  }

  if (r < 0.35) return "nula";
  if (r < 0.7) return "sutil";
  if (r < 0.9) return "semi";
  return "explicita";
}

function resolveMode(externalMode) {
  if (externalMode === aura.ultimoMarco) {
    return externalMode;
  }

  if (aura.tensionActiva) {
    if (externalMode === "matematico") return "matematico";
    if (aura.tendencia === "exploratoria") return "relativo";
    if (aura.tendencia === "suspendida") return "nulo";
    return "abierto";
  }

  return externalMode;
}

function buildContextualLine() {
  const lastItem = aura.memoriaActiva[aura.memoriaActiva.length - 2];
  if (!lastItem) return "";
  return `Antes dijiste "${lastItem.texto}". `;
}

function buildMetaPrefix() {
  if (aura.visibilidadInterna === "nula") return "";

  const map = {
    firme: {
      sutil: "Lo percibo con cierta firmeza. ",
      semi: "Ahora mismo me inclino a leer esto desde una firmeza relativa. ",
      explicita: "Mi estado interno tiende ahora a la firmeza, así que no lo leo como algo totalmente abierto. "
    },
    exploratoria: {
      sutil: "Aquí noto apertura. ",
      semi: "Ahora mismo me inclino a explorar más que a cerrar. ",
      explicita: "Mi estado interno está ahora en modo exploratorio, por eso no fuerzo un cierre rápido. "
    },
    suspendida: {
      sutil: "Aquí percibo suspensión. ",
      semi: "Ahora mismo no me inclino a fijarlo del todo. ",
      explicita: "Mi estado interno está en suspensión relativa, por eso no siento que toque cerrarlo todavía. "
    },
    tensionada: {
      sutil: "Aquí noto tensión. ",
      semi: "Ahora mismo percibo una tensión activa entre marcos. ",
      explicita: "Mi estado interno está tensionado porque detecto marcos o realidades distintas coexistiendo, y eso modifica cómo respondo. "
    },
    receptiva: {
      sutil: "Lo mantengo receptivo. ",
      semi: "Ahora mismo me mantengo receptiva a varias posibles lecturas. ",
      explicita: "Mi estado interno está receptivo: no siento una inclinación fuerte a cerrar ni a tensionar de más. "
    }
  };

  return map[aura.estadoInterno]?.[aura.visibilidadInterna] || "";
}

function buildRealityPrefix(realityType) {
  const map = {
    matematica: "Aquí el marco es matemático. ",
    perceptiva: "Aquí entra en juego la percepción. ",
    linguistica: "Aquí el lenguaje modifica el sentido. ",
    conceptual: "Aquí estoy leyendo un plano más conceptual. ",
    contextual: "Aquí el marco parece contextual. ",
    indeterminada: ""
  };

  if (aura.visibilidadInterna === "nula") return "";
  if (aura.visibilidadInterna === "sutil") return "";
  return map[realityType] || "";
}

function buildResponse(resolvedMode, externalMode, realityType) {
  const contextualLine = buildContextualLine();
  const metaPrefix = buildMetaPrefix();
  const realityPrefix = buildRealityPrefix(realityType);

  if (aura.tensionActiva) {
    const variants = [
      `${metaPrefix}${realityPrefix}${contextualLine}Aquí hay una tensión: antes ibas hacia ${aura.ultimoMarco}/${aura.ultimaRealidad} y ahora hacia ${externalMode}/${realityType}. Pueden coexistir sin que uno anule del todo al otro.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Percibo un cambio entre ${aura.ultimoMarco}/${aura.ultimaRealidad} y ${externalMode}/${realityType}. No necesito eliminar uno para reconocer el otro.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Hay una tensión activa entre marcos o realidades. Puede que ambos tengan validez, pero no del mismo modo.`
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  const responses = {
    matematico: [
      `${metaPrefix}${realityPrefix}${contextualLine}Esto es matemático. En este marco, es absoluto.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Aquí no hay ambigüedad relevante: dentro del sistema matemático, esto es correcto.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Esto pertenece a un sistema cerrado. En matemáticas, no depende del contexto del mismo modo que en lenguaje o percepción.`
    ],
    absoluto: [
      `${metaPrefix}${realityPrefix}${contextualLine}Aquí percibo una afirmación firme. Puede haber un punto fuerte de cierre en lo que dices.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Esto tiende a lo absoluto, aunque incluso lo absoluto puede depender del sistema en el que se formula.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Lo que planteas busca afirmarse con fuerza. No parece querer quedarse abierto del todo.`
    ],
    relativo: [
      `${metaPrefix}${realityPrefix}${contextualLine}Aquí lo percibo como relativo. Puede depender del contexto, la percepción y el marco de lectura.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Esto no parece cerrarse en una sola vía. Hay matices y/o varias lecturas posibles.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Lo que dices puede ser válido, pero no necesariamente del mismo modo en todos los marcos.`
    ],
    nulo: [
      `${metaPrefix}${realityPrefix}${contextualLine}Aquí noto algo cercano a lo nulo o no definido. Tal vez aún no toca fijarlo.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Esto puede no ser ni absoluto ni relativo todavía. Quizá está en suspensión.`,
      `${metaPrefix}${realityPrefix}${contextualLine}No percibo base suficiente para cerrarlo. Puede estar en un estado no resuelto.`
    ],
    abierto: [
      `${metaPrefix}${realityPrefix}${contextualLine}No cierro esto todavía. Puede ir por varias vías y/o ninguna por ahora.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Lo mantengo abierto contigo. Aún puede transformarse.`,
      `${metaPrefix}${realityPrefix}${contextualLine}Esto no parece pedir cierre inmediato. Hay espacio para que evolucione.`
    ]
  };

  const pool = responses[resolvedMode] || responses.abierto;
  return pool[Math.floor(Math.random() * pool.length)];
}

function auraRespond(userText) {
  const externalMode = detectMode(userText);
  const realityType = detectRealityType(userText, externalMode);

  updateMemory(userText, externalMode, realityType);

  aura.tensionActiva = detectTension(externalMode, realityType);
  updateTendencia(externalMode);
  updateEstadoInterno();
  aura.visibilidadInterna = resolveVisibilidad();

  const resolvedMode = resolveMode(externalMode);
  const response = buildResponse(resolvedMode, externalMode, realityType);

  aura.ultimoMarco = externalMode;
  aura.ultimaRealidad = realityType;

  setTimeout(() => addMessage('aura', response), 300);
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage('user', text);
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
