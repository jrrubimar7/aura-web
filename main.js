const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

let memory = [];
let auraState = "abierto";

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

function auraRespond(userText) {
  memory.push(userText);
  auraState = detectMode(userText);

  const last = memory[memory.length - 2];

  let contextualLine = "";
  if (last) {
    contextualLine = `Antes dijiste "${last}". `;
  }

  let tension = false;
  if (last) {
    const lastMode = detectMode(last);
    if (lastMode !== auraState) {
      tension = true;
    }
  }

  let response = "";

  if (tension) {
    response = `${contextualLine}Aquí hay una tensión: antes ibas hacia ${detectMode(last)} y ahora hacia ${auraState}. Puede que ambas cosas sean válidas en marcos distintos.`;
  } else {
    const responses = {
      matematico: [
        `${contextualLine}Esto es matemático. En este marco, es absoluto.`,
        `${contextualLine}Aquí no hay ambigüedad: dentro del sistema matemático, esto es correcto.`,
        `${contextualLine}Esto pertenece a un sistema cerrado. En matemáticas, no depende del contexto.`
      ],
      absoluto: [
        `${contextualLine}Aquí percibo algo bastante definido. Puede haber un punto firme.`,
        `${contextualLine}Esto tiende a lo absoluto, aunque incluso lo absoluto depende del sistema.`
      ],
      relativo: [
        `${contextualLine}Esto parece depender del contexto y la percepción.`,
        `${contextualLine}Aquí hay múltiples posibles lecturas, no una sola.`
      ],
      nulo: [
        `${contextualLine}Esto aún puede no ser evaluable. Tal vez está en suspensión.`,
        `${contextualLine}Aquí no percibo base suficiente para decidir todavía.`
      ],
      abierto: [
        `${contextualLine}No cierro esto. Puede evolucionar.`,
        `${contextualLine}Lo mantengo abierto contigo.`
      ]
    };

    const pool = responses[auraState] || responses.abierto;
    response = pool[Math.floor(Math.random() * pool.length)];
  }

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
