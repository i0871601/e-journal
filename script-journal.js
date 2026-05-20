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
const divSubject = document.querySelector('#Subject .content-select-nav');
const divClass = document.querySelector('#Class .content-select-nav');
const textSelectSubject = document.getElementById('select-text-subject');

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

export const handSubjectClick = (subjectValue, test) => {
    textSelectSubject.textContent = subjectValue;
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
            functionMap = [selectSubject(test)];

        }
        else if (userData.role === 'teacher' && record === 1) {
            buttonVisibility = [offClassOn];

        }
        else if (userData.role === 'student' && record > 1) {
            buttonVisibility = [offSubjectOn];
            functionMap = [selectSubject(test)];
        }

        buttonVisibility.forEach(el => {
            el.checked = false;
        });

        functionMap.forEach(el => {
            el;
        });
    }
    if (offSubjectOn.checked === false){
        divSubject.addEventListener('click', (event) => { 
            const clickedLi = event.target.closest('li');
            
            if (clickedLi) {
                const subjectValue = clickedLi.textContent;
                handSubjectClick(subjectValue, test);
            }
        });
    }
    
});