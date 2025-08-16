document.addEventListener('DOMContentLoaded', () => {
  // Отримуємо збережений текст для кнопки з localStorage
  const buttonText = localStorage.getItem('buttonText');
  

  // Перевіряємо, чи є текст для кнопки
  if (buttonText) {
    const viewButton = document.getElementById('view');
    viewButton.textContent = buttonText;  // Встановлюємо текст кнопки
  }
  // Отримуємо кнопку Schedule
  const scheduleButton = document.getElementById('scheduleButton');

  // Додаємо обробник події для натискання кнопки Schedule
  scheduleButton.addEventListener('click', () => {
    const contentSchedule = document.getElementById('scheduleText');

    // Перевіряємо, чи є вже дані в контейнері
    if (contentSchedule.querySelectorAll('p').length > 0) {
      // Якщо є елементи <p>, то дані вже були завантажені, тому не виконуємо запит
      console.log('Розклад вже завантажено.');
      return;  // Виходимо з функції, не виконуючи подальший код
    }
    // Визначаємо роль та інші параметри
    const role = localStorage.getItem('role');
    const classOrSubject = role === 'student' ? localStorage.getItem('class') : localStorage.getItem('subject');
    
    // Формуємо URL для запиту до воркера
    let url = `https://worker-schedule.i0871601.workers.dev/?`;

    if (role === 'teacher') {
      url += `role=teacher&lastName=${encodeURIComponent(localStorage.getItem('lastName'))}&subject=${encodeURIComponent(classOrSubject)}`;
    } else if (role === 'student') {
      url += `role=student&class=${encodeURIComponent(classOrSubject)}`;
    }

    // Відправляємо запит до воркера
    fetch(url)
      .then(res => res.json())
      .then(data => {
      console.log('Розклад отримано:', data); // Виводимо результат у консоль
        
        const contentSchedule = document.getElementById('scheduleText');
        // Сортування даних за днями тижня та номерами уроків
        const dayOrder = {
          "Понеділок": 1,
          "Вівторок": 2,
          "Середа": 3,
          "Четверг": 4,
          "П'ятниця": 5,
        };

        // Сортуємо дані за днями та номерами уроків
        data.sort((a, b) => {
          const dayA = dayOrder[a.Day] || 99;
          const dayB = dayOrder[b.Day] || 99;
          if (dayA !== dayB) return dayA - dayB;
          return a.lessonNumber - b.lessonNumber;
        });

        // Групуємо по днях
        const groupedByDay = {};
        data.forEach(row => {
          const day = row.Day;
          if (!groupedByDay[day]) groupedByDay[day] = [];
          groupedByDay[day].push(row);
        });

        // Показуємо уроки для кожного дня
        for (const day in groupedByDay) {
          const dayBlock = document.createElement('div');
          dayBlock.classList.add('schedule-day');
          
          // Заголовок дня
          const dayHeader = document.createElement('h3');
          dayHeader.textContent = day;
          dayBlock.appendChild(dayHeader);
          
          // Сортуємо уроки всередині дня за номером уроку
          groupedByDay[day].sort((a, b) => a.lessonNumber - b.lessonNumber);
          
          // Якщо є уроки в цей день
          groupedByDay[day].forEach(item => {
            const lessonInfo = document.createElement('p');
            if(role === 'student'){
              lessonInfo.innerHTML = `${item.lessonNumber} | ${item.Time} | ${item.Subject} | ${item.Teacher_LastName} ${item.Link ? `<a href="${item.Link}" target="_blank">Посилання</a>` : ''}`;
            }
            else if(role === 'teacher'){
              lessonInfo.innerHTML = `${item.lessonNumber} | ${item.Time} | ${item.Subject} | ${item.Class} | ${item.Link ? `<a href="${item.Link}" target="_blank">Посилання</a>` : ''}`;
            }
            dayBlock.appendChild(lessonInfo);  // Додаємо інформацію про урок в контейнер
          });

          // Додаємо блок дня до основного контейнера
          contentSchedule.appendChild(dayBlock);
        }
      })

      .catch(err => {
        console.error('Помилка запиту:', err); // Виводимо помилку у консоль
      });
  });
});



