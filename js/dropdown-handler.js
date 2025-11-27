// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.

import { request, getUserData } from './config.js';
import { displayFullJournal, displayGrades } from './journal-tables.js';
import { setupAddLessonForm } from './grade-client.js';

let selectedSubjectForTeacher = null;

function populateDropdown(listElement, data, type) {
    if (!listElement) {
        console.error("Помилка: Не знайдено елемент списку для заповнення.");
        return;
    }

    listElement.innerHTML = '';

    let items = [];
    if (type === "subjects") {
        items = data.map(item => ({ text: item.subject, dataset: { teacherLastName: item.teacherLastName || "" } }));
    } else if (type === "classesBySubject") {
        for (const subject in data) {
            const classes = Array.isArray(data[subject]) ? data[subject] : [];
            classes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
            classes.forEach(className => {
                items.push({ text: className, dataset: { subject: subject } });
            });
        }
    } else if (type === "simpleList") {
        items = data.map(item => ({ text: item, dataset: {} }));
    }

    items.sort((a, b) => a.text.localeCompare(b.text, undefined, { numeric: true, sensitivity: "base" }));

    items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item.text;
        for (const key in item.dataset) {
            listItem.dataset[key] = item.dataset[key];
        }
        listElement.appendChild(listItem);
    });
}

function setupListSelection(listElement, buttonTextElement, onSelectCallback) {
    listElement.addEventListener('click', async (event) => {
        if (event.target.tagName === 'LI') {
            const selectedText = event.target.textContent;
            buttonTextElement.textContent = selectedText;

            const radioElement = listElement.previousElementSibling.previousElementSibling;
            if (radioElement && radioElement.type === 'radio') {
                radioElement.checked = false;
                if (typeof radioElement.resetClickCount === 'function') {
                    radioElement.resetClickCount();
                }
            }

            await onSelectCallback(selectedText, event.target.dataset);
        }
    });
}

function handleTeacherSubjectSelection(selectedSubject, dataset, userData) {
    selectedSubjectForTeacher = selectedSubject;
    const classListElement = document.getElementById("class-list");
    const classButtonTextElement = document.querySelector("#button-select-class .first-option");
    const classContainer = document.getElementById("CustomSelectClassTeacher");

    if (classListElement && classButtonTextElement && classContainer) {
        classContainer.style.display = 'block';

        const classesData = userData.data.data[selectedSubject] || [];
        let classesForSubject = [];
        if (classesData.length > 0 && typeof classesData[0] === 'string') {
            classesForSubject = classesData[0].split(',').map(item => item.trim()).filter(Boolean);
        }

        populateDropdown(classListElement, classesForSubject, "simpleList");
    }
}

function createUpdateGradeCallback(subject, className) {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    return async (grade, lessonNumber, studentFirstName, studentLastName, lessonType) => {
        const payload = {
            action: 'updateGrade',
            userData,
            grade,
            lessonNumber,
            studentFirstName,
            studentLastName,
            subject,
            lessonType,
            className
        };

        const response = await request(payload);
        console.log("Відповідь на оновлення оцінки:", response);

        if (response.success) {
            console.log("Оцінка успішно оновлена.");
        } else {
            console.error("Помилка оновлення оцінки:", response.message);
        }
    };
}
function setupRadioToggleOnClick(labelId, radioId) {
    const labelElement = document.getElementById(labelId);
    const radioElement = document.getElementById(radioId);

    if (!labelElement || !radioElement) {
        console.log(`Помилка: Не знайдено label або радіо.`);
        return;
    }
    let clickCount = 0;

    radioElement.resetClickCount = () => {
        clickCount = 0;
        console.log(`Лічильник скинуто на 0 через зовнішній виклик.`);
    };

    labelElement.addEventListener('click', (event) => {
        clickCount++;
        console.log(clickCount);
        
        if(clickCount === 2){
            setTimeout(() => {
                radioElement.checked = false;
                clickCount = 0;
                console.log(clickCount);
            }, 10);
        } else if(clickCount === 1){
            console.log(clickCount);
        } else if(clickCount > 2){
            clickCount = 1;
            console.log(clickCount);
        }

    });
}

function handleClick(event) {
    const gradeOfJournalContainer = document.getElementById('GradeOfJournal');
    const dropdownContainers = document.querySelectorAll('#CustomSelectSubject, #CustomSelectClassTeacher');
    
    const isClickInsideGradeOfJournal = gradeOfJournalContainer && gradeOfJournalContainer.contains(event.target);
        dropdownContainers.forEach(container => {
            if (!container.contains(event.target)) {
                const radioElement = container.querySelector('input[type="radio"]');
                if (radioElement && radioElement.checked) {
                    radioElement.checked = false;
                    if (typeof radioElement.resetClickCount === 'function') {
                        radioElement.resetClickCount();
                        console.log(`Лічильник скинуто на 0 через натискання поза межами списку`);
                    }
                }
            }
        });
}

export function initDropdown() {
    const userData = getUserData();
    if (!userData || !userData.data) {
        console.error("Помилка: Неповні дані користувача для ініціалізації випадаючого списку.");
        return;
    }

    const { role, data, classOrsubject } = userData;

    if (role === 'student') {
        const listElement = document.getElementById("subject-list");
        const buttonTextElement = document.querySelector("#button-select-subject .first-option");

        if (listElement && buttonTextElement) {
            populateDropdown(listElement, data.data, "subjects");
            setupListSelection(listElement, buttonTextElement, async (subject, dataset) => {
                const firstClassOrSubject = classOrsubject.split(',')[0].trim();
                const payload = {
                    action: 'journal',
                    subject: subject,
                    teacherLastName: dataset.teacherLastName,
                    className: firstClassOrSubject
                };
                const response = await request(payload);
                console.log("Відправка до API:", payload);
                console.log(`Відповідь:`, response);
                if (response && response.grades && response.grades.length > 0) {
                    displayGrades(response, `${userData.lastName} ${userData.firstName}`);
                } else {
                    console.log("Відповідь від API пуста або не містить даних журналу.");
                }
                console.log("Запит на отримання журналу учня відправлено.");
            });
            console.log("Список предметів для учня заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів учня.");
        }

    } else if (role === 'teacher') {
        const subjectContainer = document.getElementById("CustomSelectSubject");
        const listElement = document.getElementById("subject-list");
        const buttonTextElement = document.querySelector("#button-select-subject .first-option");
        const classListElement = document.getElementById("class-list");
        const classButtonTextElement = document.querySelector("#button-select-class .first-option");

        if (subjectContainer && listElement && buttonTextElement && classListElement && classButtonTextElement) {
            const subjects = Object.keys(userData.data.data);

            if (subjects.length === 1) {
                const selectedSubject = subjects[0];
                subjectContainer.style.display = 'none';
                handleTeacherSubjectSelection(selectedSubject, null, userData);
            } else {
                subjectContainer.style.display = 'block';
                populateDropdown(listElement, subjects.map(s => ({ subject: s })), "subjects");
                setupListSelection(listElement, buttonTextElement, async (selectedSubject, dataset) => {
                    handleTeacherSubjectSelection(selectedSubject, dataset, userData);});
            }
            setupListSelection(classListElement, classButtonTextElement, async (className, classDataset) => {
                const refreshJournal = async () => {
                    const payload = {
                        action: 'journal',
                        subject: selectedSubjectForTeacher,
                        className: className
                    };
                    const response = await request(payload);
                        
                    if (response && response.success) {
                        console.log("Відправка до API:", payload);
                        console.log(`Відповідь:`, response);
                            
                        const updateGradeCallback = createUpdateGradeCallback(selectedSubjectForTeacher, className);
                        displayFullJournal(response, updateGradeCallback); 
                        setupAddLessonForm(selectedSubjectForTeacher, className, response, refreshJournal);
                    } else {
                        console.error("Помилка при отриманні журналу:", response.message);
                    }
                };
                refreshJournal();
            });
            
            console.log("Списки для вчителя заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списків вчителя.");
        }
    }
    setupRadioToggleOnClick('button-select-subject', 'subject-radio');
    setupRadioToggleOnClick('button-select-class', 'class-radio');
    if (!document.body.dataset.globalClickHandlerAttached) {
        document.addEventListener('click', handleClick);
        document.body.dataset.globalClickHandlerAttached = true;
    }
}