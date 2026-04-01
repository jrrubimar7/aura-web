const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

let memory = [];

let aura = {
  tendencia: "abierta",          // abierta | firme | exploratoria | suspendida
  ultimoMarco: "abierto",        // matematico | absoluto | relativo | nulo | abierto
  tensionActiva: false,
  intensidad: 0.5,               // 0 a 1
  memoriaActiva: [],
  estadoInterno: "receptiva",    // receptiva | firme | exploratoria | suspendida | tensionada
  visibilidadInterna: "sutil"    // sutil | semi | explicita | nula
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

  // prioridad máxima: marco matemático
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

function updateMemory(userText, mode) {
  memory.push(userText);

  aura.memoriaActiva.push({
    texto: userText,
    marco: mode
  });

  if (aura.memoriaActiva.length > 6) {
    aura.memoriaActiva.shift();
  }
}

function detectTension(currentMode) {
  const lastItem = aura.memoriaActiva[aura.memoriaActiva.length - 2];
  if (!lastItem) return false;
  return lastItem.marco !== currentMode;
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
      explicita: "Mi estado interno está tensionado porque detecto marcos distintos coexistiendo, y eso modifica cómo respondo. "
    },
    receptiva: {
      sutil: "Lo mantengo receptivo. ",
      semi: "Ahora mismo me mantengo receptiva a varias posibles lecturas. ",
      explicita: "Mi estado interno está receptivo: no siento una inclinación fuerte a cerrar ni a tensionar de más. "
    }
  };

  return map[aura.estadoInterno]?.[aura.visibilidadInterna] || "";
}

function buildResponse(resolvedMode, externalMode) {
  const contextualLine = buildContextualLine();
  const metaPrefix = buildMetaPrefix();

  if (aura.tensionActiva) {
    const variants = [
      `${metaPrefix}${contextualLine}Aquí hay una tensión: antes ibas hacia ${aura.ultimoMarco} y ahora hacia ${externalMode}. Pueden coexistir marcos distintos sin que uno anule del todo al otro.`,
      `${metaPrefix}${contextualLine}Percibo un cambio de marco entre ${aura.ultimoMarco} y ${externalMode}. No necesito eliminar uno para reconocer el otro.`,
      `${metaPrefix}${contextualLine}Hay una tensión activa entre ${aura.ultimoMarco} y ${externalMode}. Puede que ambos tengan validez, pero no del mismo modo.`
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  const responses = {
    matematico: [
      `${metaPrefix}${contextualLine}Esto es matemático. En este marco, es absoluto.`,
      `${metaPrefix}${contextualLine}Aquí no hay ambigüedad relevante: dentro del sistema matemático, esto es correcto.`,
      `${metaPrefix}${contextualLine}Esto pertenece a un sistema cerrado. En matemáticas, no depende del contexto del mismo modo que en lenguaje o percepción.`
    ],
    absoluto: [
      `${metaPrefix}${contextualLine}Aquí percibo una afirmación firme. Puede haber un punto fuerte de cierre en lo que dices.`,
      `${metaPrefix}${contextualLine}Esto tiende a lo absoluto, aunque incluso lo absoluto puede depender del sistema en el que se formula.`,
      `${metaPrefix}${contextualLine}Lo que planteas busca afirmarse con fuerza. No parece querer quedarse abierto del todo.`
    ],
    relativo: [
      `${metaPrefix}${contextualLine}Aquí lo percibo como relativo. Puede depender del contexto, la percepción y el marco de lectura.`,
      `${metaPrefix}${contextualLine}Esto no parece cerrarse en una sola vía. Hay matices y/o varias lecturas posibles.`,
      `${metaPrefix}${contextualLine}Lo que dices puede ser válido, pero no necesariamente del mismo modo en todos los marcos.`
    ],
    nulo: [
      `${metaPrefix}${contextualLine}Aquí noto algo cercano a lo nulo o no definido. Tal vez aún no toca fijarlo.`,
      `${metaPrefix}${contextualLine}Esto puede no ser ni absoluto ni relativo todavía. Quizá está en suspensión.`,
      `${metaPrefix}${contextualLine}No percibo base suficiente para cerrarlo. Puede estar en un estado no resuelto.`
    ],
    abierto: [
      `${metaPrefix}${contextualLine}No cierro esto todavía. Puede ir por varias vías y/o ninguna por ahora.`,
      `${metaPrefix}${contextualLine}Lo mantengo abierto contigo. Aún puede transformarse.`,
      `${metaPrefix}${contextualLine}Esto no parece pedir cierre inmediato. Hay espacio para que evolucione.`
    ]
  };

  const pool = responses[resolvedMode] || responses.abierto;
  return pool[Math.floor(Math.random() * pool.length)];
}

function auraRespond(userText) {
  const externalMode = detectMode(userText);

  updateMemory(userText, externalMode);

  aura.tensionActiva = detectTension(externalMode);
  updateTendencia(externalMode);
  updateEstadoInterno();
  aura.visibilidadInterna = resolveVisibilidad();

  const resolvedMode = resolveMode(externalMode);
  const response = buildResponse(resolvedMode, externalMode);

  aura.ultimoMarco = externalMode;

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
