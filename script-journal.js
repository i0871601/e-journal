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


document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    let test = [];
    if (userData && userData.data.classes) {
        test = userData.data.classes;
        console.log("Ось ваш масив:", test);

        const subjectsCount = Object.keys(test).length;

        // Перевіряємо кількість елементів
        if (subjectsCount === 1) {
            console.log("У вас один предмет");
        } else if (subjectsCount > 1) {
            console.log(`Кількість предметів: ${subjectsCount}`);
        } else {
            console.log("Даних про предмети немає");
        }
    }
    
});