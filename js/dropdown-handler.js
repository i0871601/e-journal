// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.

import { request } from './config.js';
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

export function closeAllDropdowns() {
    const allDropdowns = document.querySelectorAll('.dropdown-list');
    allDropdowns.forEach(dropdown => {
        dropdown.classList.remove('.visible-list');
        
        // Знаходимо батьківський елемент і видаляємо клас
        const parentContainer = dropdown.parentElement;
        if (parentContainer && parentContainer.classList.contains('click-button')) {
            console.log("Проблема зовні");
            parentContainer.classList.remove('click-button');
        }
    });
}

function setupToggle(buttonElement, listElement) {
    if (!buttonElement || !listElement) {
        console.error("Помилка: Не знайдено кнопку або список для налаштування перемикача.");
        return;
    }
    const parentContainer = buttonElement.parentElement;
    buttonElement.addEventListener('click', (event) => {
        event.stopPropagation();
        const isListVisible = listElement.classList.contains('visible-list');
        if (!isListVisible) {
            closeAllDropdowns();
            listElement.classList.add('visible-list');
            parentContainer.classList.add('click-button');
        } else {
            listElement.classList.remove('visible-list');
            parentContainer.classList.remove('click-button');
        }
    });
    document.addEventListener('click', (event) => {
        if (!buttonElement.contains(event.target) && !listElement.contains(event.target)) {
            listElement.classList.remove('visible-list');
            parentContainer.classList.remove('click-button');
        }
    });
}

function setupListSelection(listElement, buttonTextElement, onSelectCallback) {
    listElement.addEventListener('click', async (event) => {
        if (event.target.tagName === 'LI') {
            const selectedText = event.target.textContent;
            buttonTextElement.textContent = selectedText;
            listElement.classList.remove('visible-list');

            const buttonElement = listElement.previousElementSibling;
            if (buttonElement && buttonElement.parentElement) {
                buttonElement.parentElement.classList.remove('click-button');
            }
            await onSelectCallback(selectedText, event.target.dataset);
        }
    });
}

function handleTeacherSubjectSelection(selectedSubject, dataset, userData) {
    selectedSubjectForTeacher = selectedSubject;
    const classListElement = document.getElementById("class-list");
    const classButtonTextElement = document.querySelector("#Class-button p");
    const classContainer = document.getElementById("ClassTeacher");

    if (classListElement && classButtonTextElement && classContainer) {
        classContainer.style.display = 'block';

        const classesData = userData.data.data[selectedSubject] || [];
        let classesForSubject = [];
        if (classesData.length > 0 && typeof classesData[0] === 'string') {
            classesForSubject = classesData[0].split(',').map(item => item.trim()).filter(Boolean);
        }

        populateDropdown(classListElement, classesForSubject, "simpleList");
        classButtonTextElement.textContent = "Виберіть клас";
        classListElement.classList.remove('visible-list');
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

export function initDropdown(userData) {
    if (!userData || !userData.data) {
        console.error("Помилка: Неповні дані користувача для ініціалізації випадаючого списку.");
        return;
    }

    const { role, data, classOrsubject } = userData;

    if (role === 'student') {
        const listElement = document.getElementById("subject-list");
        const buttonElement = document.getElementById("subject-button");
        const buttonTextElement = document.querySelector("#subject-button p");

        if (listElement && buttonElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            populateDropdown(listElement, data.data, "subjects");
            setupToggle(buttonElement, listElement);
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
                    displayGrades(response.grades, userData.role, `${userData.lastName} ${userData.firstName}`);
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
        const subjectContainer = document.getElementById("Select-Subject");
        const listElement = document.getElementById("subject-list");
        const buttonElement = document.getElementById("subject-button");
        const buttonTextElement = document.querySelector("#subject-button p");
        const classListElement = document.getElementById("class-list");
        const classButtonElement = document.getElementById("Class-button");
        const classButtonTextElement = document.querySelector("#Class-button p");

        if (subjectContainer && listElement && buttonElement && buttonTextElement && classListElement && classButtonElement && classButtonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            const subjects = Object.keys(userData.data.data);

            if (subjects.length === 1) {
                const selectedSubject = subjects[0];
                subjectContainer.style.display = 'none';
                handleTeacherSubjectSelection(selectedSubject, null, userData);
            } else {
                subjectContainer.style.display = 'block';
                populateDropdown(listElement, subjects.map(s => ({ subject: s })), "subjects");
                setupToggle(buttonElement, listElement);
                setupListSelection(listElement, buttonTextElement, async (selectedSubject, dataset) => {
                    handleTeacherSubjectSelection(selectedSubject, dataset, userData);});
            }
            setupToggle(classButtonElement, classListElement);
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
}








