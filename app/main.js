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
  const response =
    `Recibo: "${userText}". ` +
    `No voy a cerrarlo demasiado pronto. ` +
    `Puede haber una vía directa, y/o otra más abierta, y/o algo que todavía no estamos viendo.`;

  setTimeout(() => addMessage('aura', response), 250);
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
