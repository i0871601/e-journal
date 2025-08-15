let groupedByDay = {}; // Глобально зберігаємо розклад

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date)) return isoString;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const role = localStorage.getItem('role');
  const buttonText = localStorage.getItem('buttonText');
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  const classOrSubject = role === 'student' ? localStorage.getItem('class') : localStorage.getItem('subject');

  const viewButton = document.getElementById('view');
  viewButton.textContent = buttonText;

  const scheduleButton = document.getElementById('viewSchudule');
  const resultsContainerWrapper = document.getElementById('results-container');
  const resultContainer = document.getElementById('results');

  const dayButtons = document.querySelectorAll('.day-btn');

  // 📌 Показати розклад (тільки 1 раз)
  scheduleButton.addEventListener('click', function () {
    resultsContainerWrapper.style.display = 'block';

    // Якщо вже завантажено — не повторювати fetch
    if (Object.keys(groupedByDay).length > 0) return;

    let url = 'https://worker-home.i0871601.workers.dev/?';
    if (role === 'teacher') {
      url += `role=teacher&lastName=${encodeURIComponent(lastName)}&subject=${encodeURIComponent(classOrSubject)}`;
    } else {
      url += `role=student&class=${encodeURIComponent(classOrSubject)}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          resultContainer.innerHTML = '<p>У розкладі уроків немає</p>';
          return;
        }

        const dayOrder = {
          "Понеділок": 1,
          "Вівторок": 2,
          "Середа": 3,
          "Четверг": 4,
          "П'ятниця": 5,
          "Субота": 6,
          "Неділя": 7
        };

        data.sort((a, b) => {
          const dayA = dayOrder[a[2]] || 99;
          const dayB = dayOrder[b[2]] || 99;
          return dayA !== dayB ? dayA - dayB : a[0] - b[0];
        });

        // ✅ Заповнюємо глобальну змінну
        data.forEach(row => {
          const day = row[2];
          if (!groupedByDay[day]) groupedByDay[day] = [];
          groupedByDay[day].push(row);
        });
      })
      .catch(error => {
        console.error('Помилка при завантаженні:', error);
        resultContainer.innerHTML = '<p>Сталася помилка при завантаженні розкладу.</p>';
      });
  });

  // 🟢 Обробники кнопок днів — працюють незалежно
  dayButtons.forEach(button => {
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
            const time = formatTime(row[1]);
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
              a.textContent = ' Посилання на урок';
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
});
