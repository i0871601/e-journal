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

const offClassOn = document.getElementById('off-class-on');


document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    let test = [];
    if (userData && userData.data.classes) {
        test = userData.data.classes;
        console.log("Ось ваш масив:", test);

        const subjectsCount = test.length;

        if (userData.role === 'teacher') {
            if (subjectsCount > 1) offClassOn.checked = false;
        }
    }
    
});