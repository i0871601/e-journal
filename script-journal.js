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

const offSubjectOn = document.getElementById('off-subject-on');
const offClassOn = document.getElementById('off-class-on');

export const fillingSubject = () => {

};

document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    let test = [];
    if (userData && userData.data.classes) {
        test = userData.data.classes;
        console.log("Ось ваш масив:", test);

        const subjectsCount = test.length;

        if (userData.role === 'teacher' && subjectsCount > 1) {
            offSubjectOn.checked = false;
            offClassOn.checked = false;
        }
        else if (subjectsCount === 1 || userData.role === 'student') {
            const buttonVisibility = null;
            if (subjectsCount === 1) buttonVisibility = (userData.role === 'student') ? [null] : [offClassOn];
            else buttonVisibility = (userData.role === 'student') ? [offSubjectOn] : [null];
            buttonVisibility.checked = false;

        }
    }
    
});