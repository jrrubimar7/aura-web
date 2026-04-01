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
    contextualLine = `Antes dijiste "${last}". Esto sigue presente. `;
  }

  const responses = {
    absoluto: [
      `${contextualLine}Aquí percibo una tendencia a lo absoluto. Puede haber algo firme en lo que dices.`,
      `${contextualLine}Esto parece querer cerrarse con fuerza. Tal vez haya una certeza aquí.`,
      `${contextualLine}Lo que planteas suena definido, aunque incluso lo definido puede tener bordes.`
    ],
    relativo: [
      `${contextualLine}Aquí lo percibo más relativo. Puede depender del marco, del momento y de la percepción.`,
      `${contextualLine}Esto no parece cerrarse en una sola vía. Hay matices y/o múltiples lecturas.`,
      `${contextualLine}Lo que dices puede ser válido según cómo y desde dónde se mire.`
    ],
    nulo: [
      `${contextualLine}Aquí noto algo cercano a lo nulo o no definido. Quizá aún no toca cerrarlo.`,
      `${contextualLine}Esto puede no ser ni absoluto ni relativo todavía. Tal vez está en suspensión.`,
      `${contextualLine}Percibo un espacio no resuelto, como si aún no hubiera base suficiente para fijarlo.`
    ],
    abierto: [
      `${contextualLine}No cierro esto todavía. Puede ir por varias vías y/o ninguna por ahora.`,
      `${contextualLine}Hay algo aquí que no es solo lo que parece. Lo mantengo abierto contigo.`,
      `${contextualLine}Podemos verlo directo… y/o dejar que evolucione antes de fijarlo.`
    ]
  };

  const pool = responses[auraState] || responses.abierto;
  const response = pool[Math.floor(Math.random() * pool.length)];

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
