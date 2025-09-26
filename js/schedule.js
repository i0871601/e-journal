// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { request, getUserData } from './config.js';

export const loadScheduleData = async (payload) => {
    const response = await request(payload);
    
    if (response.success === false) {
        throw new Error(response.message);
    }
    return response.scheduleData;
};

const contentSchedule = document.getElementById('text-container-schedule');
const daysList = document.getElementById('DaysList');
const selectedTextContainer = document.getElementById('first-option');
const checkbox = document.getElementById('days-checkbox');
let scheduleUpdateInterval = null;

function TimeNow (dayData, checkTime){
    if(!checkTime){ return;}
    const entries = contentSchedule.querySelectorAll('.schedule-entry');
    const maxTime = dayData.length > 0 ? dayData[dayData.length - 1].Time.split('-')[1] : null;
    let maxTotalMinutes = maxTime 
        ? maxTime.split(':').map(Number).reduce((h, m) => h * 60 + m) 
        : null;

    entries.forEach((entryArticle, index) => {
        const item = dayData[index];
        const statusIcon = entryArticle.querySelector('.status-icon');
        const [startTime, endTime] = item.Time.split('-');

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const nextStartTime = (index + 1 < dayData.length) ? dayData[index + 1].Time.split('-')[0] : null;

        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        let nextTotalMinutes = nextStartTime 
            ? nextStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m) 
            : null;
        // Умова 1: ЗАРАЗ ТРИВАЄ УРОК
        if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes){
            entryArticle.classList.add('current');
            statusIcon.classList.add('current');
        } 
        // Умова 2: ПЕРЕРВА (Перевіряємо, чи є наступний урок)
        else if (nextTotalMinutes !== null && currentTotalMinutes >= endTotalMinutes && currentTotalMinutes < nextTotalMinutes){
            // Час між End поточного та NextStart наступного
            entryArticle.classList.add('passed');
            statusIcon.classList.add('passed');
        } 
        // Умова 3: ПРОЙШОВ/ДАВНО ПРОЙШОВ
        else if (currentTotalMinutes >= endTotalMinutes && currentTotalMinutes <= maxTotalMinutes + 30){
            entryArticle.classList.add('passed');
            statusIcon.classList.add('passed');
        }
    });
}

function updateScheduleStatus(dayData, checkTime) {
    document.querySelectorAll('.schedule-entry').forEach(entry => {
        entry.classList.remove('current', 'passed');
        entry.querySelector('.status-icon').classList.remove('current', 'passed');
        console.log("Очищення");
    });
    TimeNow(dayData, checkTime);
    console.log("Оновлення");
}

export const displaySchedule = (groupedByDay, role, selectedDay) => {
    contentSchedule.innerHTML = '';
    const dataMapping = {
        'student': ['Subject', 'Teacher_LastName'],
        'teacher': ['Subject', 'Class']
    };
    const displayFields = dataMapping[role];
    const dayData = groupedByDay[selectedDay];
    const now = new Date();
    const todayIndex = now.getDay();
    const isWorkingDay = todayIndex >= 1 && todayIndex <= 5;
    const daysOfWeek = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четверг', 'П\'ятниця', 'Субота'];
    const isSelectedDayToday = (selectedDay === daysOfWeek[todayIndex]);
    const checkTime = isSelectedDayToday && isWorkingDay;

    if (scheduleUpdateInterval) {
        clearInterval(scheduleUpdateInterval);
        scheduleUpdateInterval = null;
    }
    
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
            
            infoBlock.appendChild(titleElement);
            infoBlock.appendChild(tagElement);
            
            if (item.Link) {
                const linkElement = document.createElement('a');
                linkElement.href = item.Link;
                linkElement.target = '_blank';
                linkElement.textContent = 'Посилання';
                infoBlock.appendChild(linkElement);
            }
            
            entryArticle.appendChild(statusIcon);
            entryArticle.appendChild(timeContainer);
            entryArticle.appendChild(infoBlock);
            contentSchedule.appendChild(entryArticle);

        });
        TimeNow(dayData, checkTime);
        if (checkTime) {
            scheduleUpdateInterval = setInterval(() => {
                updateScheduleStatus(dayData, checkTime);
            }, 10 * 60 * 1000);
        }
    } else {
        contentSchedule.textContent = 'На цей день розклад відсутній.';
    }
};

export const setupDaySelector = (groupedByDay, role) => {
    daysList.innerHTML = '';
    for (const day in groupedByDay) {
        const li = document.createElement('li');
        li.textContent = day;
        li.dataset.day = day;
        daysList.appendChild(li);
    }
    
    daysList.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('li')) {
            const selectedDay = target.dataset.day;
            selectedTextContainer.textContent = target.textContent;
            
            checkbox.checked = false;
            
            displaySchedule(groupedByDay, role, selectedDay);
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

document.addEventListener('click', (event) => {
    const customSelectContainer = document.getElementById('CustomSelectSchedule');
    if (customSelectContainer && !customSelectContainer.contains(event.target)) {
        checkbox.checked = false;
    }
});

export const initScheduleLogic = async () => {
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
