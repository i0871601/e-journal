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



document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    let routine = [];
    if (userData && userData.data.routine) {
        routine = userData.data.routine;
        console.log("Ось ваш масив routine:", routine);
    }

    const listDay = createListDay(routine); 
    console.log("Унікальні дні тижня:", listDay);

    renderDaysList(listDay);
});