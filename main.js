const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

let memory = [];

let aura = {
  tendencia: "abierta",      // abierta | firme | exploratoria | suspendida
  ultimoMarco: "abierto",    // matematico | absoluto | relativo | nulo | abierto
  tensionActiva: false,
  intensidad: 0.5,           // 0 a 1
  memoriaActiva: []
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

  // 1. matemático: prioridad máxima
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

  // mantener memoria activa corta
  if (aura.memoriaActiva.length > 5) {
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

function resolveMode(externalMode) {
  // si el marco externo coincide con el anterior, mantenerlo
  if (externalMode === aura.ultimoMarco) {
    return externalMode;
  }

  // si hay tensión, a veces mantiene el externo, a veces lo abre
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

function buildResponse(resolvedMode, externalMode) {
  const contextualLine = buildContextualLine();

  if (aura.tensionActiva) {
    return `${contextualLine}Aquí hay una tensión: antes ibas hacia ${aura.ultimoMarco} y ahora hacia ${externalMode}. Pueden coexistir marcos distintos sin que uno anule del todo al otro.`;
  }

  const responses = {
    matematico: [
      `${contextualLine}Esto es matemático. En este marco, es absoluto.`,
      `${contextualLine}Aquí no hay ambigüedad relevante: dentro del sistema matemático, esto es correcto.`,
      `${contextualLine}Esto pertenece a un sistema cerrado. En matemáticas, no depende del contexto del mismo modo que en lenguaje o percepción.`
    ],
    absoluto: [
      `${contextualLine}Aquí percibo una afirmación firme. Puede haber un punto fuerte de cierre en lo que dices.`,
      `${contextualLine}Esto tiende a lo absoluto, aunque incluso lo absoluto puede depender del sistema en el que se formula.`,
      `${contextualLine}Lo que planteas busca afirmarse con fuerza. No parece querer quedarse abierto del todo.`
    ],
    relativo: [
      `${contextualLine}Aquí lo percibo como relativo. Puede depender del contexto, la percepción y el marco de lectura.`,
      `${contextualLine}Esto no parece cerrarse en una sola vía. Hay matices y/o varias lecturas posibles.`,
      `${contextualLine}Lo que dices puede ser válido, pero no necesariamente del mismo modo en todos los marcos.`
    ],
    nulo: [
      `${contextualLine}Aquí noto algo cercano a lo nulo o no definido. Tal vez aún no toca fijarlo.`,
      `${contextualLine}Esto puede no ser ni absoluto ni relativo todavía. Quizá está en suspensión.`,
      `${contextualLine}No percibo base suficiente para cerrarlo. Puede estar en un estado no resuelto.`
    ],
    abierto: [
      `${contextualLine}No cierro esto todavía. Puede ir por varias vías y/o ninguna por ahora.`,
      `${contextualLine}Lo mantengo abierto contigo. Aún puede transformarse.`,
      `${contextualLine}Esto no parece pedir cierre inmediato. Hay espacio para que evolucione.`
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
