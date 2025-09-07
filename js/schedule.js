// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
// Цей файл об'єднує логіку API-запитів, маніпуляцій з DOM та основну логіку ініціалізації розкладу.

import { request, API_URL_SCHEDULE, getUserData } from '../config.js';

// === ФУНКЦІЇ ДЛЯ ВЗАЄМОДІЇ З API (з schedule-api.js) ===
export const loadScheduleData = async (payload) => {
    console.log("Лог 3: Дані, отримані в API-скрипті:", payload);
    const response = await request(API_URL_SCHEDULE, payload);
    
    if (response.success === false) {
        throw new Error(response.message);
    }
    console.log("Лог 4: Дані, які повертаємо:", response.scheduleData);
    return response.scheduleData;
};

// === ФУНКЦІЇ ДЛЯ КЕРУВАННЯ DOM (з schedule-dom.js) ===
const contentSchedule = document.getElementById('scheduleText');
const dayList = document.getElementById('Days');
const selectedTextContainer = document.querySelector('.first-option p');
const firstOptionDiv = document.querySelector('.first-option');
const selectContainer = document.getElementById('Select');

export const displaySchedule = (groupedByDay, role, selectedDay) => {
    contentSchedule.innerHTML = '';

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

export const setupDaySelector = (groupedByDay, role) => {
    dayList.innerHTML = '';
    for (const day in groupedByDay) {
        const listItem = document.createElement('li');
        listItem.textContent = day;
        listItem.dataset.day = day;
        dayList.appendChild(listItem);
    }
    selectedTextContainer.textContent = 'Виберіть день уроків';
    
    firstOptionDiv.addEventListener('click', () => {
        dayList.classList.toggle('visible');
    });

    dayList.addEventListener('click', (event) => {
        const selectedDay = event.target.dataset.day;
        if (selectedDay) {
            selectedTextContainer.textContent = selectedDay;
            dayList.classList.remove('visible');
            displaySchedule(groupedByDay, role, selectedDay);
        }
    });

    document.addEventListener('click', (event) => {
        const isClickOutside = !selectContainer.contains(event.target);
        if (isClickOutside && dayList.classList.contains('visible')) {
            dayList.classList.remove('visible');
        }
    });
};

export const setScheduleLoadingState = () => {
    contentSchedule.textContent = 'Завантаження розкладу...';
};

export const setScheduleLoadedState = () => {
    contentSchedule.dataset.loaded = 'true';
    contentSchedule.textContent = '';
};

export const displayScheduleError = (message) => {
    contentSchedule.textContent = message;
};

// === ОСНОВНА ЛОГІКА ІНІЦІАЛІЗАЦІЇ (з головного файлу) ===
export const initScheduleLogic = async () => {
    const contentSchedule = document.getElementById('scheduleText');
    if (contentSchedule.dataset.loaded === 'true') {
        return;
    }

    setScheduleLoadingState();

    try {
        const userData = getUserData();
        console.log("Лог 1: Дані користувача з сесії:", userData);
        if (!userData) {
            displayScheduleError('Помилка: Немає даних користувача.');
            setScheduleLoadedState();
            return;
        }

        const payload = {
            action: 'schedule'
        };
        console.log("Лог 2: Відправка до API:", payload);

        // Викликаємо функцію, що знаходиться в цьому ж файлі
        const groupedByDay = await loadScheduleData(payload);

        if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
            displayScheduleError('Розклад відсутній.');
            setScheduleLoadedState();
            return;
        }

        // Викликаємо функції, що знаходяться в цьому ж файлі
        setupDaySelector(groupedByDay, userData.role);
        setScheduleLoadedState();

    } catch (err) {
        console.error('Помилка запиту:', err);
        displayScheduleError(err.message || 'Не вдалося завантажити розклад. Спробуйте пізніше.');
    }
};