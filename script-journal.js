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
let electSubject = null;
let electClass = null;

export const fillingSubject = () => {

};

document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    let test = [];
    let buttonVisibility = null;
    if (userData && userData.data.classes) {
        test = userData.data.classes;
        console.log("Ось ваш масив:", test);

        const record = test.length;

        if (userData.role === 'teacher' && record > 1) {
            buttonVisibility = [offSubjectOn, offClassOn];
        }
        else if (userData.role === 'teacher' && record === 1) {
            buttonVisibility = [offClassOn];
        }
        else if (userData.role === 'student' && record > 1) {
            buttonVisibility = [offSubjectOn];
        }

        buttonVisibility.forEach(el => {
            el.checked = false;
        });
    }
    
});