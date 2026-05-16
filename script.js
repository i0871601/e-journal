// Авторське право (c) травень 2026 рік Сікан Іван Валерійович.
import { request, getUserData } from './config.js';

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

    const routine = userData.routine;
    console.log("Ось ваш масив routine:", routine);
});