// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.

import { request, getUserData } from './config.js';

export const loadScheduleData = async (payload) => {
    const response = await request(payload);
    
    if (response.success === false) {
        throw new Error(response.message);
    }
    return response.scheduleData;
};

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
        dayData.forEach(item => {
            const entryArticle = document.createElement('article');
            entryArticle.classList.add('schedule-entry');

            const statusIcon = document.createElement('span');
            statusIcon.classList.add('status-icon');

            const timeContainer = document.createElement('div');
            timeContainer.classList.add('time')

            const [startTime, endTime] = item.Time.split('-');

            const startTimeElement = document.createElement('p');
            startTimeElement.classList.add('start-time');
            startTimeElement.textContent = startTime;

            const endTimeElement = document.createElement('p');
            endTimeElement.classList.add('end-time');
            endTimeElement.textContent = endTime;
            
            timeContainer.appendChild(startTimeElement);
            timeContainer.appendChild(endTimeElement);

            const infoBlock = document.createElement('div');
            infoBlock.classList.add('info-block');

            const titleElement = document.createElement('h3');
            titleElement.classList.add('title');
            titleElement.textContent = item[displayFields[0]];

            const tagElement = document.createElement('p');
            tagElement.classList.add('tag');
            tagElement.textContent = item[displayFields[1]];

            if (item.Link) {
                const linkElement = document.createElement('a');
                linkElement.href = item.Link;
                linkElement.target = '_blank';
                linkElement.textContent = 'Посилання';
                infoBlock.appendChild(linkElement);
            }

            infoBlock.appendChild(titleElement);
            infoBlock.appendChild(tagElement);
            
            entryArticle.appendChild(statusIcon);
            entryArticle.appendChild(timeContainer);
            entryArticle.appendChild(infoBlock);

            contentSchedule.appendChild(entryArticle);
         });
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
        const isVisible = dayList.classList.toggle('visible');
        if (isVisible) {
            selectContainer.classList.add('click-button');
        } else {
            selectContainer.classList.remove('click-button'); 
        }
    });

    dayList.addEventListener('click', (event) => {
        const selectedDay = event.target.dataset.day;
        if (selectedDay) {
            selectedTextContainer.textContent = selectedDay;
            dayList.classList.remove('visible');
            selectContainer.classList.remove('click-button');
            displaySchedule(groupedByDay, role, selectedDay);
        }
    });

    document.addEventListener('click', (event) => {
        const isClickOutside = !selectContainer.contains(event.target);
        if (isClickOutside && dayList.classList.contains('visible')) {
            dayList.classList.remove('visible');
            selectContainer.classList.remove('click-button');
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

        const groupedByDay = await loadScheduleData(payload);

        if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
            displayScheduleError('Розклад відсутній.');
            setScheduleLoadedState();
            return;
        }
        setupDaySelector(groupedByDay, userData.role);
        setScheduleLoadedState();

    } catch (err) {
        console.error('Помилка запиту:', err);
        displayScheduleError(err.message || 'Не вдалося завантажити розклад. Спробуйте пізніше.');
    }

};





