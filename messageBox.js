// messageBox.js

import { getUserData } from './js/config.js';

const messageBoxHTML = `
  <div id="message-box">
    <div id="user-id"></div>
    <div id="message-text"></div>
  </div>`;

const messageBoxStyles = `
  #message-box {
    position: absolute;
    right: 0;
    top: 3vmin;
    width: 0%;
    height: 0;
    padding-top: 7%;
    opacity: 0;
    transition: width 0.5s ease-in-out, opacity 0.5s ease-in-out;
  }
`;


// Функція для ініціалізації: створює розмітку
function initializeMessageBox() {
  const bodyElement = document.body;
  if (!bodyElement) return;

  const styleTag = document.createElement('style');
  styleTag.textContent = messageBoxStyles;
  document.head.appendChild(styleTag);
  
  bodyElement.insertAdjacentHTML('afterbegin', messageBoxHTML);
}

// Функція для заповнення контейнера user-id
function UserID() {
  const user = getUserData();

  // Перевіряємо, чи є об'єкт користувача
  if (user) {
    const userIdElement = document.getElementById('user-id');
    if (userIdElement) {
      const pTag = document.createElement('p');
      pTag.textContent = `${user.firstName} ${user.lastName}`;
      userIdElement.appendChild(pTag);
      showMessageBox();
    }
  }
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
        messageBox.style.width = '45%';
        messageBox.style.opacity = '1';
    }
}

// Функція для зміни кольору фону message-box, тепер залежить від результату getUserData()
function FonColor() {
  const messageBox = document.getElementById('message-box');
  if (!messageBox) return;

  // Отримуємо дані користувача з config.js
  const user = getUserData();

  // Логіка для авторизованого користувача
  if (user) {
    const toggleSchedule = document.getElementById('toggle-schedule');
    const toggleJournal = document.getElementById('toggle-journal');
    
    // Якщо хоча б один з чекбоксів відмічений
    if ((toggleSchedule && toggleSchedule.checked) || (toggleJournal && toggleJournal.checked)) {
      messageBox.style.backgroundColor = 'lime';
    } else {
      messageBox.style.backgroundColor = 'transparent';
    }
  } 
  // Логіка для неавторизованого користувача
  else {
    const bodyColor = getComputedStyle(document.body).getPropertyValue('--fon-color');
    if (bodyColor) {
      if (bodyColor.trim() === '#151419') {
        messageBox.style.backgroundColor = '#0000ff';
      } else {
        messageBox.style.backgroundColor = '#cccccc';
      }
    }
  }
}

// Запускаємо логіку, коли DOM повністю завантажено
document.addEventListener('DOMContentLoaded', () => {
  initializeMessageBox();
  UserID();
  FonColor();

  const toggleSchedule = document.getElementById('toggle-schedule');
  const toggleJournal = document.getElementById('toggle-journal');
    
  if (toggleSchedule) {
    toggleSchedule.addEventListener('change', FonColor);
  }
  if (toggleJournal) {
    toggleJournal.addEventListener('change', FonColor);
  }
});

export { FonColor };










