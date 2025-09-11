// dropdown.js

import { request, API_URL_STUDENT_JOURNAL, API_URL_FULL_JOURNAL } from './config.js';
import { displayFullJournal, displayGrades } from './journal-tables.js';
import { setupAddLessonForm } from './js/grade-client.js';

let selectedSubjectForTeacher = null;

/**
 * Універсальна функція для заповнення випадаючого списку.
 * @param {HTMLElement} listElement - Елемент <ul> для заповнення.
 * @param {Array|Object} data - Дані для списку.
 * @param {string} type - Тип даних ("subjects", "classesBySubject" або "simpleList").
 */
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

/**
 * Встановлює обробник подій для перемикання видимості списку.
 * @param {HTMLElement} buttonElement - Кнопка, яка перемикає список.
 * @param {HTMLElement} listElement - Елемент списку <ul>.
 */
function setupToggle(buttonElement, listElement) {
    if (!buttonElement || !listElement) {
        console.error("Помилка: Не знайдено кнопку або список для налаштування перемикача.");
        return;
    }

    buttonElement.addEventListener('click', (event) => {
        event.stopPropagation();
        listElement.style.display = listElement.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
        if (!buttonElement.contains(event.target) && !listElement.contains(event.target)) {
            listElement.style.display = 'none';
        }
    });
}

/**
 * Встановлює обробник подій для елементів списку.
 * @param {HTMLElement} listElement - Елемент <ul>.
 * @param {HTMLElement} buttonTextElement - Елемент <p> в кнопці.
 * @param {Function} onSelectCallback - Колбек-функція, яка викликається після вибору.
 */
function setupListSelection(listElement, buttonTextElement, onSelectCallback) {
    listElement.addEventListener('click', async (event) => {
        if (event.target.tagName === 'LI') {
            const selectedText = event.target.textContent;
            buttonTextElement.textContent = selectedText;
            listElement.style.display = 'none';
            await onSelectCallback(selectedText, event.target.dataset);
        }
    });
}

/**
 * Колбек-функція, що обробляє вибір предмета вчителем.
 * @param {string} selectedSubject - Вибраний предмет.
 * @param {object} dataset - dataset вибраного елемента.
 * @param {object} userData - Дані користувача.
 */
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
        classListElement.style.display = 'none';
    }
}


/**
 * Ініціалізує та заповнює випадаючі списки на основі ролі користувача.
 * @param {object} userData - Об'єкт даних користувача.
 */
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
                const response = await request(API_URL_STUDENT_JOURNAL, payload);
                console.log("Відправка до API:", payload);
                console.log(`Відповідь:`, response);
                displayGrades(response.grades, userData.role, `${userData.lastName} ${userData.firstName}`);
                console.log("✅ Запит на отримання журналу учня відправлено.");
            });
            console.log("✅ Список предметів для учня заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів учня.");
        }

    } else if (role === 'teacher') {
        const listElement = document.getElementById("subject-list");
        const buttonElement = document.getElementById("subject-button");
        const buttonTextElement = document.querySelector("#subject-button p");

        if (listElement && buttonElement && buttonTextElement) {
            buttonTextElement.textContent = "Виберіть предмет";
            const subjects = Object.keys(userData.data.data).map(s => ({ subject: s }));
            populateDropdown(listElement, subjects, "subjects");
            setupToggle(buttonElement, listElement);

            const classListElement = document.getElementById("class-list");
            const classButtonElement = document.getElementById("Class-button");
            const classButtonTextElement = document.querySelector("#Class-button p");
            if (classListElement && classButtonElement && classButtonTextElement) {
                setupToggle(classButtonElement, classListElement);
                setupListSelection(classListElement, classButtonTextElement, async (className, classDataset) => {
                    const payload = {
                       action: 'journal',
                       subject: selectedSubjectForTeacher,
                       className: className
                    };
                    const response = await request(API_URL_FULL_JOURNAL, payload);
                    console.log("Відправка до API:", payload);
                    console.log(`Відповідь:`, response);

                    // ✅ Додана перевірка наявності даних у відповіді
                    if (response && response.journalData && response.journalData.length > 0) {
                        setupAddLessonForm(response.journalData, selectedSubjectForTeacher, className);
                        const updateGradeCallback = (gradeData, newValue) => {
                            console.log("Оновлення оцінки:", gradeData, "Нове значення:", newValue);
                        };
                        displayFullJournal(response.journalData, updateGradeCallback);
                    } else {
                        console.log("Відповідь від API пуста або не містить даних журналу.");
                    }
                });   
                setupListSelection(listElement, buttonTextElement, async (selectedSubject, dataset) => {
                handleTeacherSubjectSelection(selectedSubject, dataset, userData);
            });
            console.log("✅ Список предметів для вчителя заповнено та налаштовано.");
        } else {
            console.error("Помилка: Не знайдено елементи для списку предметів вчителя.");
        }
    }
}




