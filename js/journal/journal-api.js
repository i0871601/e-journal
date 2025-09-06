//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { request, API_URL_UPDATE_GRADE, API_URL_FULL_JOURNAL, API_URL_ADD_LESSON, API_URL_GRADES_JOURNAL, API_URL_STUDENT_JOURNAL } from '../config.js';

export const updateOrAddGrade = async (gradeData) => {
    const payload = {
        action: "update_grade",
        ...gradeData
    };
    console.log("Журнал API Лог 1 (Запит): Відправка оновлення оцінки:", payload);
    const response = await request(API_URL_UPDATE_GRADE, payload);
    console.log("Журнал API Лог 2 (Відповідь): Отримано результат оновлення оцінки:", response);
    return response;
};

export const loadFullJournalData = async (className, subject) => {
    const payload = {
        action: "load_full_journal",
        className: className,
        subject: subject
    };
    console.log("Журнал API Лог 3 (Запит): Завантаження повного журналу для класу:", payload);
    const response = await request(API_URL_FULL_JOURNAL, payload);
    console.log("Журнал API Лог 4 (Відповідь): Отримано дані повного журналу:", response);
    if (response.success === false) {
        throw new Error(response.message);
    }
    return response.journalData;
};

export const addLessonToJournal = async (lessonData) => {
    const payload = {
        action: "add_lesson",
        ...lessonData
    };
    console.log("Журнал API Лог 5 (Запит): Відправка додавання уроку:", payload);
    const response = await request(API_URL_ADD_LESSON, payload);
    console.log("Журнал API Лог 6 (Відповідь): Отримано результат додавання уроку:", response);
    return response;
};

export async function loadDropdownOptionsData(subject) {
    const payload = {
        action: "get_dropdown_options",
        subject: subject
    };
    console.log("Журнал API Лог 7 (Запит): Завантаження опцій для випадаючого списку:", payload);
    const response = await request(API_URL_GRADES_JOURNAL, payload);
    console.log("Журнал API Лог 8 (Відповідь): Отримано опції для випадаючого списку:", response);
    if (response.success === false) {
        throw new Error(response.message);
    }
    return response;
}

export const loadStudentGradesData = async (params) => {
    const payload = {
        action: "get_student_grades",
        ...params
    };
    console.log("Журнал API Лог 9 (Запит): Завантаження оцінок студента:", payload);
    const response = await request(API_URL_STUDENT_JOURNAL, payload);
    console.log("Журнал API Лог 10 (Відповідь): Отримано оцінки студента:", response);
    if (response.success === false) {
        throw new Error(response.message);
    }
    return response;
};