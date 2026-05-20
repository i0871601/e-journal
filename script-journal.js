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
const divSubject = document.getElementById('Subject');
const divClass = document.getElementById('Class');

let electSubject = null;
let electClass = null;

export const selectSubject = (map) => {
    console.log("Ось ваш масив:", map);
    map.forEach(el => {
        const liElement = document.createElement('li');
        liElement.textContent = el.Subject;
        divSubject.appendChild(liElement);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    let test = [];
    let buttonVisibility = null;
    let functionMap = null;
    if (userData && userData.data.classes) {
        test = userData.data.classes;

        const record = test.length;

        if (userData.role === 'teacher' && record > 1) {
            buttonVisibility = [offSubjectOn, offClassOn];
            functionMap = [selectSubject(test)]
        }
        else if (userData.role === 'teacher' && record === 1) {
            buttonVisibility = [offClassOn];

        }
        else if (userData.role === 'student' && record > 1) {
            buttonVisibility = [offSubjectOn];
            functionMap = [selectSubject(test)]
        }

        buttonVisibility.forEach(el => {
            el.checked = false;
        });

        functionMap.forEach(el => {
            el;
        });
    }
    
});