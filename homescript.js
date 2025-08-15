document.addEventListener("DOMContentLoaded", function() {
  const role = localStorage.getItem('role');
  const buttonText = localStorage.getItem('buttonText');
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  const classOrSubject = role === 'student' ? localStorage.getItem('class') : localStorage.getItem('subject');
  
  const viewButton = document.getElementById('view');
  viewButton.textContent = buttonText;
  
  const scheduleButton = document.getElementById('viewSchudule'); // Отримуємо кнопку для показу розкладу
  const resultsContainerWrapper = document.getElementById('results-container');
  const resultContainer = document.getElementById('results'); // Отримуємо контейнер, в який будемо вставляти розклад

  // Обробник кліку по кнопці "Показати розклад"
  scheduleButton.addEventListener('click', function () {
    resultsContainerWrapper.style.display = 'block';
    let url = 'https://worker-home.i0871601.workers.dev/?';

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
          resultContainer.innerHTML = '<p>У розкладі уроків немає</p>';
          return;
        }
        // Визначаємо порядок днів тижня
        const dayOrder = {
          "Понеділок": 1,
          "Вівторок": 2,
          "Середа": 3,
          "Четверг": 4,
          "П'ятниця": 5,
          "Субота": 6,
          "Неділя": 7
        };
        // Сортуємо спочатку по дню тижня, потім по номеру уроку
        data.sort((a, b) => {
          const dayA = dayOrder[a[2]] || 99; // Якщо день не знайдено — ставимо великий номер
          const dayB = dayOrder[b[2]] || 99;
          if (dayA !== dayB) {
            return dayA - dayB;
          }
          return a[0] - b[0]; // Порівняння номерів уроків
        });


        // Групуємо по днях
        const groupedByDay = {};
        data.forEach(row => {
          const day = row[2];
          if (!groupedByDay[day]) groupedByDay[day] = [];
          groupedByDay[day].push(row);
        });

        // 🔸 Обробка натискання кнопок
        document.querySelectorAll('.day-btn').forEach(button => {
          button.addEventListener('click', () => {
            const selectedDay = button.getAttribute('data-day');
            const lessons = groupedByDay[selectedDay] || [];
          
            resultContainer.innerHTML = '';
            
            const dayTitle = document.createElement('h3');
            dayTitle.textContent = selectedDay;
            resultContainer.appendChild(dayTitle);
            
            if (lessons.length === 0) {
              const noLessonText = document.createElement('p');
              noLessonText.textContent = 'День без уроків';
              resultContainer.appendChild(noLessonText);
              return;
            }
            
            const lessonMap = {};
            lessons.forEach(row => {
              const lessonNum = row[0];
              if (!lessonMap[lessonNum]) lessonMap[lessonNum] = [];
              lessonMap[lessonNum].push(row);
            });
            
            const lessonCount = 8;
            
            for (let i = 1; i <= lessonCount; i++) {
              const rows = lessonMap[i];
              if (rows) {
                rows.forEach(row => {
                  const time = row[1];
                  const className = row[3];
                  const subject = row[4];
                  const teacherLastName = row[5];
                  const link = row[6];
                  
                  let text = '';
                  
                  if (role === 'student') {
                    text = `${i}. ${time}, ${selectedDay}, ${className}, ${subject}, ${teacherLastName}`;
                  } else {
                    text = `${i}. ${time}, ${selectedDay}, ${className}`;
                  }
                  
                  const p = document.createElement('p');
                  p.textContent = text;
                  
                  if (link && link.trim() !== '') {
                    const a = document.createElement('a');
                    a.href = link;
                    a.textContent = 'Посилання на урок';
                    a.target = '_blank';
                    p.appendChild(a);
                  }
                  
                  resultContainer.appendChild(p);
                });
              } else {
                const p = document.createElement('p');
                p.textContent = `${i}. Немає урока...`;
                resultContainer.appendChild(p);
              }
            }
          });
        });
      // (можна автоматично відкрити розклад на сьогодні тут, якщо хочеш)
      })
      .catch(error => {
        // Якщо сталася помилка при запиті — повідомляємо
        console.error('Помилка при завантаженні:', error);
        resultContainer.innerHTML = '<p>Сталася помилка при завантаженні розкладу.</p>';
      });
  });
});