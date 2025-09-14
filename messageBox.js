// messageBox.js
import { getUserData } from './js/config.js';

const messageBoxHTML = `
  <div id="message-box">
    <div id="message-text"></div>
    <div id="message-icon"></div>
  </div>`;
//для фото aspect-ratio: 1 / 1;
const messageBoxStyles = `
  #message-box {
    display: flex;
    flex-direction: row-reverse;
    /*background-color: #151419;*/
    position: absolute;
    right: 0;
    top: 3vmin;
    width: 0%;
    height: 7%;
    opacity: 0;
    transition: width 0.5s ease-in-out, opacity 0.5s ease-in-out;
    /*transition: background-color 0.5s ease-in-out, width 0.5s ease-in-out, opacity 0.5s ease-in-out;*/
    overflow: hidden;
  }
  #message-box p{
    white-space: nowrap;
    overflow: hidden;
    padding: 0;
    margin: 0;
    opacity: 0;
  }
  #message-box.light-theme {
    background-color: #fbfbfb;
  }
  #message-box.dark-theme {
    background-color: #151419;
  }
  #message-box.show-message-box {
    width: 45%;
    opacity: 1;
  }
  #message-box.show-message-box #message-box p {
    opacity: 1;
  }
  #message-icon{
    display: none;
    align-items: center;
    justify-content: center;
    height: 100%;
    opacity: 0;
  }
  #message-icon svg{
    height: 80%;
    width: auto;
    /*transition: fill 0.5s ease-in-out;*/
  }
  #message-box.light-theme #message-icon svg {
    fill: #151419; /* Колір іконки для світлого фону */
  }
  #message-box.dark-theme #message-icon svg {
    fill: #fbfbfb; /* Колір іконки для темного фону */
  }
  #message-icon.show-message-box{
    display: flex;
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
//створює зображення
async function loadSvg(url, containerId) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Помилка завантаження SVG: ${response.status} ${response.statusText}`);
    }
    const svgCode = await response.text();
    const container = document.getElementById(containerId);

    if (container) {
      // Видаляємо попередню іконку перед вставкою нової
      container.innerHTML = svgCode;
    }
  } catch (error) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<p style="color:red; font-size:12px;">Error</p>`;
      console.error('Помилка завантаження SVG:', error);
    }
  }
}

// Функція для оновлення тексту в message-text
export function MessageText(text, status = 'default') {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    const messageTextElement = document.getElementById('message-text');
    messageBox.classList.remove('message-box--success', 'message-box--error');
    if (status === 'success') {
      //messageBox.classList.add('message-box--success'); 
    } else if (status === 'error') {
      //messageBox.classList.add('message-box--error');
    }
    //логіку статуса поки пуста для того щоб протестувати

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

      const contimg = document.getElementById('message-icon');//тут поки для тестування пізніше перенесем до логіки коли статус помилка
      contimg.classList.add('show-message-box'); //тут поки для тестування пізніше перенесем до логіки коли статус помилка
      messageBox.classList.add('show-message-box');

      messageBoxTimeoutId = setTimeout(() => {
        messageBox.classList.remove('show-message-box');
        contimg.classList.remove('show-message-box');
        messageBox.classList.remove('message-box--success', 'message-box--error'); //тут поки для тестування
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
  
  const isDarkTheme = (toggleSchedule && toggleSchedule.checked) || (toggleJournal && toggleJournal.checked);
  if (isDarkTheme) {
    messageBox.classList.add('dark-theme');
    messageBox.classList.remove('light-theme');
  } else {
    messageBox.classList.add('light-theme');
    messageBox.classList.remove('dark-theme');
  }
}

// Запускаємо логіку, коли DOM повністю завантажено
document.addEventListener('DOMContentLoaded', () => {
    clearTimeout(messageBoxTimeoutId);
    messageBoxTimeoutId = null;
    initializeMessageBox();
    loadSvg('./image/error.svg', 'message-icon');
    FonColor();
    const user = getUserData();
    if(user){
      const textIDuser = `Увійшов ${user.firstName} ${user.lastName}`;
      setTimeout(() => { MessageText(textIDuser, 'success');}, 2000);
    }
});

export {FonColor};











