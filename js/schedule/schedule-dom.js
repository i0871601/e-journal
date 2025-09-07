// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
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