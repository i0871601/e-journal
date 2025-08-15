document.addEventListener("DOMContentLoaded", function() {
  const role = localStorage.getItem('role');
  const buttonText = localStorage.getItem('buttonText');
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  const classOrSubject = role === 'student' ? localStorage.getItem('class') : localStorage.getItem('subject');
  
  const viewButton = document.getElementById('view');
  viewButton.textContent = buttonText;
  
  const scheduleButton = document.getElementById('viewSchudule'); // Отримуємо кнопку для показу розкладу
  const resultContainer = document.getElementById('results'); // Отримуємо контейнер, в який будемо вставляти розклад

  // Обробник кліку по кнопці "Показати розклад"
  scheduleButton.addEventListener('click', function () {
    let url = 'https://script.google.com/macros/s/AKfycbwyj5zXNvWiDQugL9gPl5QpwEvlUy4h4AylkQtjGMGxdz6bKYcC7ttJi__RCY5w7ajgWQ/exec?';
 // Формуємо базовий URL для запиту до Google Apps Script
    // Додаємо параметри до URL в залежності від ролі
    if (role === 'teacher') {
      url += `role=teacher&lastName=${encodeURIComponent(lastName)}&subject=${encodeURIComponent(classOrSubject)}`;
    } else if (role === 'student') {
      url += `role=student&class=${encodeURIComponent(classOrSubject)}`;
    }

    // Виконуємо GET-запит на сервер (GAS)
    fetch(url)
      .then(response => response.json()) // Очікуємо JSON-відповідь
      .then(data => {
        // Очищаємо контейнер перед вставкою нових результатів
        resultContainer.innerHTML = '';

        // Якщо збігів немає — повідомляємо
        if (data.length === 0) {
          resultContainer.innerHTML = '<p>Збігів не знайдено.</p>';
          return;
        }

        // Перебираємо кожен рядок з результату
        data.forEach(row => {
          /**
           * Очікувана структура кожного рядка:
           * row[0] — Номер уроку
           * row[1] — Час
           * row[2] — День
           * row[3] — Клас
           * row[4] — Предмет
           * row[5] — Прізвище
           * row[6] — Посилання (може бути порожнім)
           */

          const lessonNumber = row[0];
          const time = row[1];
          const day = row[2];
          const className = row[3];
          const subject = row[4];
          const teacherLastName = row[5];
          const link = row[6];

          let text = '';

          // Формуємо текст рядка в залежності від ролі
          if (role === 'student') {
            // Учень бачить: №. час, день, клас, предмет, викладач
            text = `${lessonNumber}. ${time}, ${day}, ${className}, ${subject}, ${teacherLastName}`;
          } else if (role === 'teacher') {
            // Вчитель бачить: №. час, день, клас
            text = `${lessonNumber}. ${time}, ${day}, ${className}`;
          }

          // Створюємо елемент <p> з текстом
          const p = document.createElement('p');
          p.textContent = text;

          // Якщо є посилання — додаємо як <a> всередину <p>
          if (link && link.trim() !== '') {
            const a = document.createElement('a');
            a.href = link;
            a.textContent = ' [Посилання]';
            a.target = '_blank'; // Відкрити в новій вкладці
            p.appendChild(a);
          }

          // Додаємо <p> у контейнер результатів
          resultContainer.appendChild(p);
        });
      })
      .catch(error => {
        // Якщо сталася помилка при запиті — повідомляємо
        console.error('Помилка при завантаженні:', error);
        resultContainer.innerHTML = '<p>Сталася помилка при завантаженні розкладу.</p>';
      });
  });
});