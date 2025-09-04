//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { API_URL_UPDATE_GRADE, API_URL_FULL_JOURNAL, API_URL_ADD_LESSON, API_URL_GRADES_JOURNAL, API_URL_STUDENT_JOURNAL } from '../config.js';

export const updateOrAddGrade = async (gradeData) => {
    const url = API_URL_UPDATE_GRADE;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gradeData)
    });
    return res;
};

export const loadFullJournalData = async (className, teacherLastName, teacherSubject) => {
    const url = `${API_URL_FULL_JOURNAL}?class=${className}&teacherLastName=${teacherLastName}&teacherSubject=${teacherSubject}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Помилка мережі: ${res.status}`);
    }
    return res.json();
};

export const addLessonToJournal = async (lessonData) => {
    const url = API_URL_ADD_LESSON;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonData)
    });
    return res;
};

export const loadDropdownOptionsData = async (lastName, classOrSubject) => {
    const url = `${API_URL_GRADES_JOURNAL}?lastName=${lastName}&classOrSubject=${classOrSubject}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Помилка мережі: ${res.status}`);
    }
    return res.json();
};

export const loadStudentGradesData = async (params) => {
    const url = `${API_URL_STUDENT_JOURNAL}?studentLastName=${params.studentLastName}&studentFirstName=${params.studentFirstName}&class=${params.class}&subject=${params.subject}&teacherLastName=${params.teacherLastName}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Помилка мережі: ${res.status}`);
    }
    const data = await res.json();
    return data;
};