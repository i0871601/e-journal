// Авторське право (c) травень 2026 рік Сікан Іван Валерійович.
import { request, getUserData } from './js/config.js';

if (sessionStorage.length === 0) {
    window.location.href = '../index.html';
}
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        sessionStorage.clear();
        const form = document.getElementById('loginForm');
        form.reset();
    }
});

export const createListDay = (routine) => {
    if (!Array.isArray(routine) || routine.length === 0) {
        return [];
    }
    const dayOrder = ["Понеділок", "Вівторок", "Середа", "Четверг", "П'ятниця"];

    //Витягуємо всі дні та прибираємо дублікати
    const uniqueDays = [...new Set(routine.map(item => item.Day))];

    //Сортуємо отримані дні відповідно до dayOrder
    return uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
};

export const renderDaysList = (listDay) => {
    //Знаходимо список ul на сторінці
    const daysListContainer = document.getElementById('DaysList');
    
    if (!daysListContainer) {
        console.error("Елемент <ul id='DaysList'> не знайдено на сторінці!");
        return;
    }
    daysListContainer.innerHTML = '';
    // Перевіряємо, чи масив днів не порожній
    if (!Array.isArray(listDay) || listDay.length === 0) {
        daysListContainer.innerHTML = '<li>Пусто</li>';
        return;
    }
    //Перебирає кожен день і створюємо для нього <li>
    listDay.forEach(day => {
        const li = document.createElement('li');
        li.textContent = day;

        daysListContainer.appendChild(li);
    });
};

export const getCurrentDay = (listDay) => {
    if (!Array.isArray(listDay) || listDay.length === 0) {
        return null; 
    }

    //Отримуємо поточний день тижня
    const formatter = new Intl.DateTimeFormat('uk-UA', { weekday: 'long' });
    let current = formatter.format(new Date());

    //Робимо першу літеру великою, щоб збігалося з масивом
    current = current.charAt(0).toUpperCase() + current.slice(1);

    //Перевіряємо, чи є цей день у списку listDay
    if (listDay.includes(current)) {
        return current;
    }
    return null;
};

export const handleDayClick = (selectedDay, currentDay, routine) => {
    console.log(`Ви обрали день: ${selectedDay}`);

    const filteredLessons = routine.filter(item => item.Day === selectedDay);
    filteredLessons.sort((a, b) => Number(a.LessonNumber) - Number(b.LessonNumber));

    const inputReset = document.getElementById('reset');
    inputReset.checked = true;
    console.log(filteredLessons);
    
    return;
};


document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();
    const daysListContainer = document.getElementById('DaysList');

    let routine = [];
    if (userData && userData.data.routine) {
        routine = userData.data.routine;
        console.log("Ось ваш масив routine:", routine);
    }

    const listDay = createListDay(routine); 
    console.log("Унікальні дні тижня:", listDay);

    renderDaysList(listDay);

    const currentDay = getCurrentDay(listDay);
    console.log(currentDay);

    if (currentDay != null) {
        handleDayClick(currentDay, currentDay, routine);
    }


    daysListContainer.addEventListener('click', (event) => {
        const clickedLi = event.target.closest('li');
        
        if (clickedLi) {
            const dayValue = clickedLi.textContent;
            
            handleDayClick(dayValue, currentDay, routine);
        }
    });

});