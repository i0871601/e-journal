//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const displaySchedule = (groupedByDay, role, selectedDay) => {
    const contentSchedule = document.getElementById('scheduleText');
    contentSchedule.innerHTML = '';

    if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
        contentSchedule.textContent = 'Розклад відсутній.';
        return;
    }

    const dataMapping = {
        'student': ['Subject', 'Teacher_LastName'],
        'teacher': ['Subject', 'Class']
    };

    const displayFields = dataMapping[role];

    const dayData = groupedByDay[selectedDay];

    if (dayData && dayData.length > 0) {
        const dayBlock = document.createElement('div');
        dayBlock.classList.add('schedule-day');

        dayData.forEach(item => {
            const lessonInfo = document.createElement('p');
            const linkHtml = item.Link ? `<a href="${item.Link}" target="_blank">Посилання</a>` : '';
            const infoText = displayFields.map(field => item[field]).join(' | ');
            lessonInfo.innerHTML = `${item.Time} | ${infoText} | ${linkHtml}`;
            dayBlock.appendChild(lessonInfo);
        });
        contentSchedule.appendChild(dayBlock);
    } else {
        contentSchedule.textContent = 'На цей день розклад відсутній.';
    }
};

const setupDaySelector = (groupedByDay, role) => {
    const daysSelect = document.getElementById('Days');
    daysSelect.innerHTML = '';
    
    // Додаємо опцію за замовчуванням
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Виберіть день';
    defaultOption.value = '';
    daysSelect.appendChild(defaultOption);

    for (const day in groupedByDay) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daysSelect.appendChild(option);
    }

    daysSelect.addEventListener('change', (event) => {
        const selectedDay = event.target.value;
        if (selectedDay) {
            displaySchedule(groupedByDay, role, selectedDay);
        } else {
            document.getElementById('scheduleText').innerHTML = '';
        }
    });
};

//Завантажує розклад з воркера.
const loadSchedule = async () => {
    const contentSchedule = document.getElementById('scheduleText');
    const daysSelect = document.getElementById('Days');
    
    if (contentSchedule.dataset.loaded === 'true') {
        return;
    }

    contentSchedule.textContent = 'Завантаження розкладу...';

    try {
        const role = sessionStorage.getItem('role');
        const classOrSubject = sessionStorage.getItem('classOrsubject');
        const lastName = sessionStorage.getItem('lastName');
        const firstName = sessionStorage.getItem('firstName');

        if (!role || !classOrSubject || !lastName || !firstName) {
            window.location.href = 'index.html';
            return;
        }

        const params = new URLSearchParams();
        params.append('role', role);
        params.append('lastName', lastName);
        params.append('firstName', firstName);
        
        if (role === 'teacher') {
            params.append('subject', classOrSubject);
        } else if (role === 'student') {
            params.append('class', classOrSubject);
        }

        const url = `https://worker-schedule.i0871601.workers.dev/?${params.toString()}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Помилка мережі: ${res.status}`);
        }

        const data = await res.json();
        
        // Змінено: тепер ми заповнюємо випадаючий список та налаштовуємо обробник подій
        setupDaySelector(data, role);
        contentSchedule.dataset.loaded = 'true';
        contentSchedule.textContent = ''; // Очистити текст "Завантаження..." після завантаження

    } catch (err) {
        console.error('Помилка запиту:', err);
        contentSchedule.textContent = 'Не вдалося завантажити розклад. Спробуйте пізніше.';
    }
};

// Ініціалізація
loadSchedule();


