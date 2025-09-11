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

// ⭐️ Нова функція-фабрика, яка створює колбек для оновлення оцінки.
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
                if (response && response.journalData && response.journalData.length > 0) {
                    displayGrades(response.grades, userData.role, `${userData.lastName} ${userData.firstName}`);
                } else {
                    console.log("Відповідь від API пуста або не містить даних журналу.");
                }
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
                    const response = await request(payload);
                    console.log("Відправка до API:", payload);
                    console.log(`Відповідь:`, response);

                    if (response && response.journalData && response.journalData.length > 0) {
                        // ⭐️ Викликаємо нову функцію-фабрику
                        const updateGradeCallback = createUpdateGradeCallback(selectedSubjectForTeacher, className);
                        displayFullJournal(response.journalData, updateGradeCallback);
                        setupAddLessonForm(selectedSubjectForTeacher, className, response.journalData, async () => {
                            const refreshPayload = {
                                action: 'journal',
                                subject: selectedSubjectForTeacher,
                                className: className
                            };
                            const refreshResponse = await request(refreshPayload);
                            if (refreshResponse && refreshResponse.journalData) {
                                displayFullJournal(refreshResponse.journalData, updateGradeCallback);
                            }
                        });
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
}
