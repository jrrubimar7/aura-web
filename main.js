const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

let memory = [];

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

function auraRespond(userText) {
  memory.push(userText);

  const modes = [
    "explorando",
    "abriendo",
    "observando",
    "reconfigurando",
    "no-cerrando"
  ];

  const mode = modes[Math.floor(Math.random() * modes.length)];

  const last = memory[memory.length - 2]; // mensaje anterior

  let contextualLine = "";

  if (last) {
    contextualLine = `Antes dijiste "${last}". Esto conecta. `;
  }

  const responses = [
    `${contextualLine}Recibo: "${userText}". Estoy ${mode} esto contigo.`,
    `${contextualLine}"${userText}" puede ir por varias vías. No hace falta decidir aún.`,
    `${contextualLine}Hay algo en "${userText}" que no es solo lo que parece.`,
    `${contextualLine}Podemos verlo directo… y/o dejar que evolucione.`,
    `${contextualLine}No cierro esto. Lo mantengo en campo abierto contigo.`
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];

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
