// messageBox.js

// Розмітка, яку ви хочете динамічно створити.
// Змінна const, щоб її не можна було змінити випадково.
const messageBoxHTML = `
  <div id="message-box">
    <div id="user-id"></div>
    <div id="message-text"></div>
  </div>`;

// Функція для ініціалізації: створює розмітку та додає її в body.
// Викликається тільки один раз, коли скрипт завантажується.
function initializeMessageBox() {
  const bodyElement = document.body;
  if (bodyElement) {
    bodyElement.insertAdjacentHTML('afterbegin', messageBoxHTML);
  }
}

// Функція, яка заповнює контейнер user-id.
function UserID() {
  const user = { firstName: 'Іван', lastName: 'Петров' }; // Дані користувача
  const userIdElement = document.getElementById('user-id');
  
  if (userIdElement) {
    const pTag = document.createElement('p');
    pTag.textContent = `${user.firstName} ${user.lastName}`;
    userIdElement.appendChild(pTag);
  }
}

// Функція для оновлення тексту в message-text.
// Вона буде експортована, щоб її можна було викликати з інших файлів.
function MessageText(text) {
  const messageTextElement = document.getElementById('message-text');
  if (messageTextElement) {
    messageTextElement.textContent = text;
  }
}

// Функція для зміни кольору фону message-box на основі умов.
function FonColor() {
  const messageBox = document.getElementById('message-box');
  if (!messageBox) return; // Виходимо, якщо елемент ще не створений

  const pathname = window.location.pathname;

  // Логіка для сторінки index.html
  if (pathname.endsWith('index.html')) {
    const bodyColor = getComputedStyle(document.body).getPropertyValue('--main-color');
    if (bodyColor) {
      // Приклад: якщо колір тіла червоний, робимо messageBox синім
      if (bodyColor.trim() === '#ff0000') {
        messageBox.style.backgroundColor = '#0000ff';
      } else {
        // Інший колір за замовчуванням
        messageBox.style.backgroundColor = '#cccccc';
      }
    }
  } 
  
  // Логіка для сторінки Home.html
  else if (pathname.endsWith('Home.html')) {
    const toggleSchedule = document.getElementById('toggle-schedule');
    const toggleJournal = document.getElementById('toggle-journal');
    
    // Перевіряємо, чи відмічений один із чекбоксів
    if ((toggleSchedule && toggleSchedule.checked) || (toggleJournal && toggleJournal.checked)) {
      messageBox.style.backgroundColor = 'lime';
    } else {
      messageBox.style.backgroundColor = 'transparent';
    }
  }
}

// Запускаємо логіку, коли DOM повністю завантажено
document.addEventListener('DOMContentLoaded', () => {
  // 1. Створюємо розмітку
  initializeMessageBox();
  
  // 2. Заповнюємо дані користувача
  UserID();
  
  // 3. Встановлюємо початковий колір
  FonColor();

  // Додаємо слухачі подій для чекбоксів, якщо вони існують
  if (window.location.pathname.endsWith('Home.html')) {
    const toggleSchedule = document.getElementById('toggle-schedule');
    const toggleJournal = document.getElementById('toggle-journal');
    
    if (toggleSchedule) {
      toggleSchedule.addEventListener('change', FonColor);
    }
    if (toggleJournal) {
      toggleJournal.addEventListener('change', FonColor);
    }
  }
});

// Експортуємо лише ту функцію, яка потрібна для зовнішнього використання
export { MessageText };

