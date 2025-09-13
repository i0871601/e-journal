// messageBox.js
import { getUserData } from './js/config.js';

const messageBoxHTML = `
  <div id="message-box">
    <div id="message-text"></div>
  </div>`;
//для фото aspect-ratio: 1 / 1;
const messageBoxStyles = `
  #message-box {
    background-color: #151419;
    position: absolute;
    right: 0;
    top: 3vmin;
    width: 0%;
    height: 7%;
    opacity: 0;
    transition: width 0.5s ease-in-out, opacity 0.5s ease-in-out;
  }
  #message-box p{
    white-space: nowrap;
    overflow: hidden;
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

async function loadSvg(url, containerId) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Помилка завантаження SVG: ${response.status} ${response.statusText}`);
    }
    const svgCode = await response.text();
    const container = document.getElementById(containerId);
    if (container) {
      const existingSvg = container.querySelector('.svg-icon');
      if (existingSvg) {
        existingSvg.remove();
      }
      container.insertAdjacentHTML('afterbegin', svgCode);
    }
  } catch (error) {
    console.error('Помилка завантаження SVG:', error);
  }
}
// Функція для оновлення тексту в message-text
export function MessageText(text, status = 'default') {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    const messageTextElement = document.getElementById('message-text');
    messageBox.classList.remove('message-box--success', 'message-box--error');
    if (status === 'success') {
      //та визов функції створення картинки
      messageBox.classList.add('message-box--success');
    } else if (status === 'error') {
      loadSvg('./image/error.svg', 'message-box');
      messageBox.classList.add('message-box--error');
    }
    
    if (messageBoxTimeoutId !== null) {
        clearTimeout(messageBoxTimeoutId);
        messageBoxTimeoutId = null;
    }
    if (messageTextElement) {
      let pTag = messageTextElement.querySelector('p');
      
      if (!pTag) {
        pTag = document.createElement('p');
        messageTextElement.appendChild(pTag);
      }
      pTag.textContent = text;
      
      messageBox.classList.add('show-message-box');
      
      messageBoxTimeoutId = setTimeout(() => {
        messageBox.classList.remove('show-message-box');
        messageBox.classList.remove('message-box--success', 'message-box--error');
        if (pTag) {
          pTag.textContent = '';
        }
      }, 3000);
    }
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
    clearTimeout(messageBoxTimeoutId);
    messageBoxTimeoutId = null;
    initializeMessageBox();
    loadSvg('./image/error.svg', 'imgError');
    //loadSvg(url2, containerId1);
    FonColor();
    const user = getUserData();
    if(user){
      const textIDuser = `Увійшов ${user.firstName} ${user.lastName}`;
      setTimeout(() => { MessageText(textIDuser, 'success');}, 2000);
    }
});

export {FonColor};




