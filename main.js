const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

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
  const modes = [
    "explorando",
    "abriendo",
    "observando",
    "reconfigurando",
    "no-cerrando"
  ];

  const mode = modes[Math.floor(Math.random() * modes.length)];

  const responses = [
    `Recibo: "${userText}". Estoy ${mode} esto contigo.`,
    `"${userText}" puede ir por varias vías. No hace falta decidir aún.`,
    `Hay algo en "${userText}" que no es solo lo que parece.`,
    `Podemos verlo directo… y/o darle espacio a que evolucione.`,
    `No cierro esto. Lo mantengo en campo abierto contigo.`
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
