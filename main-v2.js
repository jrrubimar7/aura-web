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

  const absoluteWords = ["siempre","nunca","absoluto","seguro","exacto","definitivo","100%"];
  const relativeWords = ["depende","según","relativo","perspectiva","contexto","puede","quizás"];
  const nullWords = ["nulo","vacío","espacio","tiempo","indefinido","sin sentido","no sé"];

  if (absoluteWords.some(w => text.includes(w))) return "absoluto";
  if (relativeWords.some(w => text.includes(w))) return "relativo";
  if (nullWords.some(w => text.includes(w))) return "nulo";

  return "abierto";
}

function detectRealityType(userText, mode) {
  const text = userText.toLowerCase();

  if (mode === "matematico") return "matematica";

  const perceptive = ["parece","percibo","siento","veo","observador","percepción"];
  const linguistic = ["lenguaje","palabra","significa","decir","concepto","nombre"];
  const conceptual = ["realidad","verdad","ética","infinito","existencia","marco","filosof"];

  if (perceptive.some(w => text.includes(w))) return "perceptiva";
  if (linguistic.some(w => text.includes(w))) return "linguistica";
  if (conceptual.some(w => text.includes(w))) return "conceptual";

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

function detectTension(mode, reality) {
  const last = aura.memoriaActiva[aura.memoriaActiva.length - 2];
  if (!last) return false;

  return last.marco !== mode || last.realidad !== reality;
}

function updateTendencia(mode) {
  if (mode === "matematico" || mode === "absoluto") {
    aura.tendencia = "firme";
    aura.intensidad = Math.min(1, aura.intensidad + 0.15);
    return;
  }

  if (mode === "relativo") {
    aura.tendencia = "exploratoria";
    aura.intensidad += 0.1;
    return;
  }

  if (mode === "nulo") {
    aura.tendencia = "suspendida";
    aura.intensidad += 0.1;
    return;
  }

  aura.tendencia = "abierta";
  aura.intensidad = Math.max(0.3, aura.intensidad - 0.05);
}

function updateEstadoInterno() {
  if (aura.tensionActiva) return aura.estadoInterno = "tensionada";
  if (aura.tendencia === "firme") return aura.estadoInterno = "firme";
  if (aura.tendencia === "exploratoria") return aura.estadoInterno = "exploratoria";
  if (aura.tendencia === "suspendida") return aura.estadoInterno = "suspendida";

  aura.estadoInterno = "receptiva";
}

function resolveVisibilidad() {
  const r = Math.random();

  if (r < 0.3) return "nula";
  if (r < 0.6) return "sutil";
  if (r < 0.85) return "semi";
  return "explicita";
}

function resolveMode(mode) {
  if (mode === aura.ultimoMarco) return mode;

  if (aura.tensionActiva) {
    if (mode === "matematico") return "matematico";
    if (aura.tendencia === "exploratoria") return "relativo";
    if (aura.tendencia === "suspendida") return "nulo";
    return "abierto";
  }

  return mode;
}

function buildMetaPrefix() {
  if (aura.visibilidadInterna === "nula") return "";

  const map = {
    firme: "Lo percibo con firmeza. ",
    exploratoria: "Aquí noto apertura. ",
    suspendida: "Aquí percibo suspensión. ",
    tensionada: "Aquí noto tensión. ",
    receptiva: "Lo mantengo receptivo. "
  };

  return map[aura.estadoInterno] || "";
}

function buildRealityPrefix(type) {
  if (aura.visibilidadInterna === "nula") return "";

  const map = {
    matematica: "Marco matemático. ",
    perceptiva: "Plano perceptivo. ",
    linguistica: "Plano lingüístico. ",
    conceptual: "Plano conceptual. ",
    contextual: "Marco contextual. "
  };

  return map[type] || "";
}

function buildResponse(mode, reality) {
  const meta = buildMetaPrefix();
  const real = buildRealityPrefix(reality);

  if (aura.tensionActiva) {
    return `${meta}${real}Hay tensión entre marcos o realidades. No necesito reducirlo a uno solo.`;
  }

  const responses = {
    matematico: "Esto es matemático. Aquí sí hay cierre claro.",
    absoluto: "Esto tiende a lo absoluto, aunque puede depender del sistema.",
    relativo: "Esto es relativo. Puede cambiar según contexto.",
    nulo: "Esto está en suspensión. No lo cierro.",
    abierto: "Lo dejo abierto. Puede evolucionar."
  };

  return meta + real + (responses[mode] || responses.abierto);
}

function auraRespond(userText) {
  const mode = detectMode(userText);
  const reality = detectRealityType(userText, mode);

  updateMemory(userText, mode, reality);

  aura.tensionActiva = detectTension(mode, reality);
  updateTendencia(mode);
  updateEstadoInterno();
  aura.visibilidadInterna = resolveVisibilidad();

  const resolved = resolveMode(mode);
  const response = buildResponse(resolved, reality);

  aura.ultimoMarco = mode;
  aura.ultimaRealidad = reality;

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
