const socket = io();
const messagesEl = document.querySelector('#messages');
const inputElement = document.querySelector('.inputBox input');

messagesEl.innerHTML = "";

const appendMessageElement = (user, time, msg) => {
  const div = document.createElement('div');
  div.classList.add('uk-width-1-1');
  div.innerHTML = `<span class="uk-label">${user} [${time}]</span> <span class="uk-margin-left">${msg}</span>`;
  
  messagesEl.appendChild(div);

  // encierro en un set timeout
  // para que la altura del contenedor se actualice
  // con el nuevo nodo
  setTimeout(() => {
    messagesEl.scrollTo(0, messages.scrollHeight);
  }, 250);
}

const appendUserActionElement = (user, joined) => {
  const div = document.createElement('div');
  div.classList.add('uk-width-1-1');
  div.classList.add('uk-flex');
  div.classList.add('joined');

  const type = joined ? 'success' : 'danger';
  const action = joined ? 'unio' : 'salio';

  div.innerHTML = `<span class="uk-label uk-label-${type}">${user} se ${action}</span>`;

  messagesEl.appendChild(div);

  // encierro en un set timeout
  // para que la altura del contenedor se actualice
  // con el nuevo nodo
  setTimeout(() => {
    messagesEl.scrollTo(0, messages.scrollHeight);
  }, 250);
}

let messageHistoryLoaded = false;
let username = null;
let currentMessages = [];

socket.on('chat-messages', (messagesList) => {
  currentMessages = messagesList;
  if (!messageHistoryLoaded) {
    // aqui voy a renderizar los mensajes actuales del server
    for (const { user, datetime, text } of currentMessages) {
      // renderizar
      appendMessageElement(user, datetime, text);
    };
    messageHistoryLoaded = true;
  }
});

const cookies = parseCookies();

if (cookies.user) {
  username = cookies.user;
  socket.emit('user', { user: username, action: true });

  socket.on('chat-message', ({ user, datetime, text }) => {
    // renderizar el mensaje
    appendMessageElement(user, datetime, text);
  });

  socket.on('chat-message.error', ({ user, datetime, text }) => {
    // renderizar el mensaje
    appendMessageElement(user, datetime, text);
  });

  socket.on('user', ({ user, action }) => {
    appendUserActionElement(user, action);
  });


  inputElement.addEventListener('keyup', ({ key, target }) => {
    if (key !== 'Enter') {
      return;
    }

    const { value } = target;

    if (!value) {
      return;
    }

    // send message to Socket
    const date = new Date();

    const msg = { user: username, datetime: date.toLocaleTimeString('en-US'), text: value };

    socket.emit('chat-message', msg);
    target.value = "";
  });
}

function parseCookies() {
  let normalString = decodeURIComponent(document.cookie);
  return normalString
      .split(';')
      .reduce((obj, cookie) => {
        const keyValue = cookie.split('=')
        return {
          ...obj,
          [keyValue[0].trim()]: keyValue[1]
        }
      }, {})
}
