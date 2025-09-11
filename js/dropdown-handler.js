// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { request } from './config.js';
import { displayFullJournal, displayGrades } from './journal-tables.js';
import { setupAddLessonForm } from './grade-client.js';

// Об'єкт для зберігання даних поточного користувача
let userData = null;

// Зберігаємо обраний вчителем предмет
let selectedSubjectForTeacher = null;

// Допоміжні функції
const setupToggle = (button, list) => {
    button.addEventListener("click", (e) => {
        e.stopPropagation();
        list.style.display = list.style.display === "block" ? "none" : "block";
    });
};

const populateDropdown = (listElement, data, type) => {
    listElement.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item[type === "subjects" ? "subject" : "className"];
        if (type === "classes") {
            li.dataset.teacherLastName = item.teacherLastName;
        }
        listElement.appendChild(li);
    });
};

const setupListSelection = (listElement, buttonTextElement, callback) => {
    listElement.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const selectedText = e.target.textContent;
            buttonTextElement.textContent = selectedText;
            listElement.style.display = 'none';
            callback(selectedText, e.target.dataset);
        }
    });
};

// ⭐️ Оновлена функція, яка передає предмет та клас
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

async function handleTeacherSubjectSelection(selectedSubject, dataset, userData) {
    selectedSubjectForTeacher = selectedSubject;
    const classes = userData.data.data[selectedSubject].map(c => ({ className: c.class, teacherLastName: c.teacherLastName }));
    
    const classListElement = document.getElementById("class-list");
    const classButtonElement = document.getElementById("Class-button");
    const classButtonTextElement = document.querySelector("#Class-button p");

    if (classListElement && classButtonElement && classButtonTextElement) {
        classListElement.innerHTML = ''; // Очищаємо список класів
        populateDropdown(classListElement, classes, "classes");
        classButtonTextElement.textContent = "Виберіть клас";
        classButtonElement.style.display = "flex";
        console.log("✅ Список класів для вчителя заповнено та налаштовано.");
    }
}

export function initDropdown(data) {
    userData = data;
    const { role, classOrsubject } = userData;

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
                    console.log("Відповідь від API пуста або не містить даних оцінок.");
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
                        // ⭐️ Тепер передаємо предмет та клас в колбек
                        const updateGradeCallback = createUpdateGradeCallback(selectedSubjectForTeacher, className);
                        displayFullJournal(response.journalData, updateGradeCallback);
                        setupAddLessonForm(selectedSubjectForTeacher, className, response.journalData, async () => {
                            // Колбек для оновлення журналу після успішного додавання уроку
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
