// messageBox.js
import { getUserData } from './js/config.js';

const messageBoxHTML = `
  <div id="message-box">
    <div id="message-text"></div>
  </div>`;

const messageBoxStyles = `
  #message-box {
    background-color: #151419;
    position: absolute;
    right: 0;
    top: 3vmin;
    width: 0%;
    aspect-ratio: 100 / 7;
    opacity: 0;
    transition-y: width 0.5s ease-in-out, opacity 0.5s ease-in-out;
  }
  #message-box p{
    padding: 0;
    margin: 0;
  }
  #message-box.show-message-box {
    width: 45%;
    opacity: 1;
  }
`;

let messageBoxTimeoutId = null;
// Функція для ініціалізації: створює розмітку
function initializeMessageBox() {
  const bodyElement = document.body;
  if (!bodyElement) return;

  const styleTag = document.createElement('style');
  styleTag.textContent = messageBoxStyles;
  document.head.appendChild(styleTag);
  
  bodyElement.insertAdjacentHTML('afterbegin', messageBoxHTML);
}

// Функція для оновлення тексту в message-text
export function MessageText(text) {
  const messageTextElement = document.getElementById('message-text');
  if (messageTextElement) {
    let pTag = messageTextElement.querySelector('p');
    
    if (!pTag) {
      pTag = document.createElement('p');
      messageTextElement.appendChild(pTag);
    }
    pTag.textContent = text;
    showMessageBox();
  }
}

function showMessageBox() {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
      if (messageBoxTimeoutId !== null) {
        clearTimeout(messageBoxTimeoutId);
        messageBoxTimeoutId = null;
      }
      messageBox.classList.add('show-message-box');

      messageBoxTimeoutId = setTimeout(() => {
        messageBox.classList.remove('show-message-box');
        const messageTextParagraph = document.querySelector('#message-text p');
        if (messageTextParagraph) {
          messageTextParagraph.textContent = '';
        }
      }, 3000);
    }
}

// Функція для зміни кольору фону message-box, тепер залежить від результату getUserData()
function FonColor() {
  const messageBox = document.getElementById('message-box');
  if (!messageBox) return;
  const toggleSchedule = document.getElementById('toggle-schedule');
  const toggleJournal = document.getElementById('toggle-journal');
  
  if ((toggleSchedule && toggleSchedule.checked) || (toggleJournal && toggleJournal.checked)) {
    messageBox.style.backgroundColor = '#151419';
  } else {
      messageBox.style.backgroundColor = '#fbfbfb';
  }
} 

// Запускаємо логіку, коли DOM повністю завантажено
document.addEventListener('DOMContentLoaded', () => {
    messageBoxTimeoutId = null;
    initializeMessageBox();
    FonColor();
    const user = getUserData();
    if(user){
      const textIDuser = `Увійшов ${user.firstName} ${user.lastName}`;
      setTimeout(() => { MessageText(textIDuser);}, 300);
    }
});

export {FonColor};











