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
const textSelectClass = document.getElementById('select-text-class');

const inputReset = document.getElementById('reset');

let electSubject = null;
let electClass = null;
let teacherLastName = null;

export const selectSubject = (map) => {
    console.log("Ось масив:", map);
    map.forEach(el => {
        const liElement = document.createElement('li');
        liElement.textContent = el.Subject;
        divSubject.appendChild(liElement);
    });
};

export const handSubjectClick = (subjectValue, test) => {
    textSelectSubject.textContent = subjectValue;
    divClass.innerHTML = '';

    const currentRecord = test.find(el => el.Subject === subjectValue);
    if (currentRecord && currentRecord.Class) {
        const classesArray = currentRecord.Class.split(',').map(c => c.trim());
        classesArray.forEach(className => {
            const liElement = document.createElement('li');
            liElement.textContent = className;
            divClass.appendChild(liElement);
        });
    }

};

export const handClass = (electSubject, userData, map) => {
    const currentRecord = map.find(el => el.Subject === electSubject);
    if (currentRecord && currentRecord.Class && userData.classOrsubject) {
        const subjectClasses = currentRecord.Class.split(',').map(c => c.trim());
        const studentClasses = userData.classOrsubject.split(',').map(c => c.trim());
        electClass = subjectClasses.find(className => studentClasses.includes(className));
        teacherLastName = currentRecord.Teacher_LastName;
    }
}

async function formationRequests(role, subject, teacherLastName, classes) {
    const payload = {
        action: 'journal',
        subject: subject,
        teacherLastName: teacherLastName,
        className: classes
    };
                    
    const response = await request(payload);
    console.log(`Повна відповідь:`, response);

};

document.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();

    let test = [];
    let buttonVisibility = null;

    if (userData && userData.data.classes) {
        test = userData.data.classes;

        const record = test.length;

        if (userData.role === 'teacher' && record > 1) {
            buttonVisibility = [offSubjectOn, offClassOn];
            selectSubject(test);
        }
        else if (userData.role === 'teacher' && record === 1) {
            buttonVisibility = [offClassOn];
            electSubject = userData.classOrsubject;
            console.log(electSubject);
            handSubjectClick(electSubject, test);
        }
        else if (userData.role === 'student' && record > 1) {
            buttonVisibility = [offSubjectOn];
            selectSubject(test);
        }
        
    }
    if(buttonVisibility) {
        buttonVisibility.forEach(el => {
            el.checked = false;
        });
    }

    if (!offSubjectOn.checked){
        divSubject.addEventListener('click', (event) => { 
            const clickedLi = event.target.closest('li');
            
            if (clickedLi) {
                electSubject = clickedLi.textContent;
                textSelectClass.textContent = 'Клас';
                inputReset.checked = true;
                if (userData.role === 'teacher') handSubjectClick(electSubject, test);
                if (userData.role === 'student') {
                    handClass(electSubject, userData, test);
                    formationRequests(userData.role, electSubject, teacherLastName, electClass);                    
                }
            }
        });
    }

    if (!offClassOn.checked) {
        divClass.addEventListener('click', (event) => {
            const clickedLi = event.target.closest('li');

            if(clickedLi) {
                electClass = clickedLi.textContent;
                textSelectClass.textContent = electClass;
                inputReset.checked = true;
                formationRequests(userData.role, electSubject, userData.lastName, electClass);
            }
        });
    }
    
});