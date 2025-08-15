const apiURL = "https://script.google.com/macros/s/AKfycbzIRByiKc4nfm87GG2vXION_g86xfWem7nA-zf-bDo1EcEiY1WfIoZbUCQQkTKlVFd5fw/exec";

const form = document.getElementById('loginForm');
const button = document.getElementById('loginButton');
const defaultText = button.querySelector('.default-text');
const dots = button.querySelector('.dots');
const errorMessage = document.getElementById('errorMessage');

// Функція авторизації
function authorizeUser(lastName, password) {
  return fetch(`${apiURL}?lastName=${encodeURIComponent(lastName)}&password=${encodeURIComponent(password)}`, {
    method: 'GET',
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      return data; // Повертає результат з інформацією про роль
    } else {
      throw new Error(data.message);
    }
  });
}

// Обробка події авторизації
form.addEventListener('submit', function(event) {
  event.preventDefault();

  const lastName = document.getElementById('lastName').value.trim();
  const password = document.getElementById('password').value.trim();

  // Скидання попередніх повідомлень
  errorMessage.textContent = '';

  // Показ кружків (анімація)
  defaultText.classList.add('hidden');
  dots.classList.remove('hidden');
  button.disabled = true;

  // Виклик авторизації
  authorizeUser(lastName, password)
    .then(data => {
      if (data.role === 'student') {
        window.location.href = "Home-student.html"; // Перехід на сторінку учня
      } 
      else if (data.role === 'teacher') {
        window.location.href = "Home-teacher.html"; // Перехід на сторінку вчителя
      }
    })
    .catch(error => {
      errorMessage.textContent = "Помилка: " + error.message;
    })
    .finally(() => {
      // Повернення кнопки до звичайного вигляду
      defaultText.classList.remove('hidden');
      dots.classList.add('hidden');
      button.disabled = false;
    });
});

// Оновлене для кнопки "Розклад" на сторінці учня або вчителя
document.getElementById('viewSchudule').addEventListener('click', function() {
  fetchScheduleData().then(data => {
    console.log("Отримані дані розкладу:", data); // Логування даних
    displaySchedule(data);
  }).catch(error => {
    console.log("Помилка при отриманні розкладу:", error);
  });
});


// Функція для отримання даних розкладу з API
function fetchScheduleData() {
  return fetch(apiURL)  // Використовуємо той самий API для отримання розкладу
    .then(response => response.json())
    .then(data => data);  // Повертаємо дані розкладу
}

// Функція для відображення таблиці розкладу
function displaySchedule(data) {
  const content = document.getElementById('scheduleContent');
  let html = `<table>
    <thead>
      <tr>
        <th>№ уроку</th>
        <th>День</th>
        <th>Час</th>
        <th>Предмет/Клас</th>
        <th>Вчитель</th>
        <th>Посилання</th>
      </tr>
    </thead>
    <tbody>`;

  data.forEach((row) => {
    // Перевіряємо, чи ми на сторінці учня чи вчителя
    if (isStudentPage()) {
      html += `
        <tr>
          <td>${row.lessonNumber}</td>
          <td>${row.day}</td>
          <td>${row.time}</td>
          <td>${row.subject}</td>
          <td>${row.teacherLastName}</td>
          <td><a href="${row.link}" target="_blank">${row.link ? 'Join' : 'N/A'}</a></td>
        </tr>`;
    } else {
      html += `
        <tr>
          <td>${row.lessonNumber}</td>
          <td>${row.day}</td>
          <td>${row.time}</td>
          <td>${row.class}</td>
          <td>-</td>
          <td><a href="${row.link}" target="_blank">${row.link ? 'Join' : 'N/A'}</a></td>
        </tr>`;
    }
  });

  html += `</tbody></table>`;
  content.innerHTML = html;
}

// Функція для визначення, чи ми на сторінці учня
function isStudentPage() {
  return window.location.pathname.includes('studentPage.html');
}











