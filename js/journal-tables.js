// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { request } from './config.js'; // ⭐️ Імпортуємо функцію request

const tabletJournal = document.querySelector(".TabletJournal");

export const displayFullJournal = (journalData, updateGradeCallback) => {
    if (!tabletJournal) return;
    if (!journalData || journalData.length === 0) {
        tabletJournal.innerHTML = "<p>Учні ще не додані до цього класу в бази даних.</p>";
        return;
    }
    tabletJournal.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("journal-table");

    const lessonsMap = new Map();
    journalData.forEach(student => {
        student.grades.forEach(grade => {
            const lessonKey = `${grade.lessonNumber}-${grade.lessonType}`;
            if (!lessonsMap.has(lessonKey)) {
                lessonsMap.set(lessonKey, {
                    lessonNumber: grade.lessonNumber,
                    Date: grade.Date,
                    Topic: grade.Topic,
                    lessonType: grade.lessonType
                });
            }
        });
    });

    const lessonTypeOrder = {
        "Normal": 1,
        "Thematic": 2,
        "Semester": 3,
        "Final": 4
    };

    const lessons = Array.from(lessonsMap.values()).sort((a, b) => {
        if (a.lessonNumber !== b.lessonNumber) {
            return a.lessonNumber - b.lessonNumber;
        }
        return lessonTypeOrder[a.lessonType] - lessonTypeOrder[b.lessonType];
    });

    const maxNormalLessonNumber = lessons.reduce((max, lesson) => {
        if (lesson.lessonType === "Normal" && lesson.lessonNumber > max) {
            return lesson.lessonNumber;
        }
        return max;
    }, 0);

    const maxCalculatedLessonNumber = lessons.reduce((max, lesson) => {
        if (lesson.lessonType !== "Normal" && lesson.lessonNumber > max) {
            return lesson.lessonNumber;
        }
        return max;
    }, 0);

    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    const nameHeader = document.createElement("th");
    nameHeader.textContent = "Прізвище та Ім'я";
    headerRow.appendChild(nameHeader);

    lessons.forEach(lesson => {
        const lessonHeader = document.createElement("th");
        let headerText = "";
        if (lesson.lessonType === "Thematic") headerText = "Тема";
        else if (lesson.lessonType === "Semester") headerText = "Сем";
        else if (lesson.lessonType === "Final") headerText = "Річн";
        else headerText = `Урок ${lesson.lessonNumber}`;
        lessonHeader.innerHTML = `${headerText}<br><span class="lesson-date" data-topic="${lesson.Topic}">${lesson.Date}</span>`;
        headerRow.appendChild(lessonHeader);
    });

    const tableBody = table.createTBody();
    journalData.forEach(student => {
        const studentRow = tableBody.insertRow();
        const studentNameCell = studentRow.insertCell();
        studentNameCell.textContent = `${student.lastName} ${student.firstName}`;

        lessons.forEach(lesson => {
            const gradeCell = studentRow.insertCell();
            const grade = student.grades.find(g => g.lessonNumber === lesson.lessonNumber && g.lessonType === lesson.lessonType);
            const gradeValue = grade ? grade.Grade : "";
            const isEditable = (
                lesson.lessonType === "Normal" &&
                lesson.lessonNumber === maxNormalLessonNumber &&
                (maxCalculatedLessonNumber === 0 || maxNormalLessonNumber < maxCalculatedLessonNumber)
            );

            if (isEditable) { // ⭐️ Розкоментували блок
                const gradeInput = document.createElement("input");
                gradeInput.type = "text";
                gradeInput.value = gradeValue;
                gradeInput.dataset.lessonNumber = lesson.lessonNumber;
                gradeInput.dataset.lessonType = lesson.lessonType; // ⭐️ Додали lessonType
                gradeInput.dataset.studentFirstName = student.firstName;
                gradeInput.dataset.studentLastName = student.lastName;
                gradeInput.classList.add("grade-input-cell");
               
                gradeInput.addEventListener("change", (e) => {
                    const { studentLastName, studentFirstName, lessonNumber, lessonType } = e.target.dataset;
                    const newValue = e.target.value;
                    updateGradeCallback(studentLastName, studentFirstName, lessonNumber, lessonType, newValue);
                });
                gradeCell.appendChild(gradeInput);
            } else {
                const gradeSpan = document.createElement("span");
                gradeSpan.textContent = gradeValue;
                if (lesson.lessonType !== "Normal") gradeSpan.classList.add("calculated-grade");
                gradeCell.appendChild(gradeSpan);
            }
        });
    });

    tabletJournal.appendChild(table);

    const lessonDates = tabletJournal.querySelectorAll(".lesson-date");
    lessonDates.forEach(dateSpan => {
        dateSpan.addEventListener("click", () => {
            alert(`Тема уроку: ${dateSpan.dataset.topic}`);
        });
    });
};

export const displayGrades = (gradesData, role, name) => {
    if (!tabletJournal) return;
    tabletJournal.innerHTML = "";
    if (gradesData.length === 0) {
        tabletJournal.innerHTML = "<p>Оцінок з цього предмету ще немає.</p>";
        return;
    }
    const lessonsMap = new Map();
    gradesData.forEach(grade => {
        const lessonKey = `${grade.lessonNumber}-${grade.lessonType}`;
        if (!lessonsMap.has(lessonKey)) {
            lessonsMap.set(lessonKey, grade);
        }
    });

    const lessonTypeOrder = {
        "Normal": 1,
        "Thematic": 2,
        "Semester": 3,
        "Final": 4
    };

    const lessons = Array.from(lessonsMap.values()).sort((a, b) => {
        if (a.lessonNumber !== b.lessonNumber) {
            return a.lessonNumber - b.lessonNumber;
        }
        return lessonTypeOrder[a.lessonType] - lessonTypeOrder[b.lessonType];
    });

    let headerHtml = '<tr><th class="empty-header"></th>';
    lessons.forEach(lesson => {
        let headerText = "";
        if (lesson.lessonType === "Thematic") headerText = "Тема";
        else if (lesson.lessonType === "Semester") headerText = "Сем";
        else if (lesson.lessonType === "Final") headerText = "Річн";
        else headerText = `Урок ${lesson.lessonNumber}`;
        headerHtml += `<th class="lesson-header">${headerText}<br><span class="lesson-date" data-topic="${lesson.Topic}">${lesson.Date}</span></th>`;
    });
    headerHtml += "</tr>";

    let bodyHtml = `<tr><td>${name}</td>`;
    lessons.forEach(lesson => {
        const grade = gradesData.find(g => g.lessonNumber === lesson.lessonNumber && g.lessonType === lesson.lessonType);
        const gradeValue = grade && grade.Grade !== null && grade.Grade !== "null" ? grade.Grade : "";
        const gradeType = grade ? grade.lessonType : null;
        let gradeHtml = gradeValue;
        if (gradeType !== "Normal" && gradeType !== null) {
            gradeHtml = `<span class="calculated-grade">${gradeValue}</span>`;
        }
        bodyHtml += `<td class="grade-cell">${gradeHtml}</td>`;
    });
    bodyHtml += "</tr>";

    const tableHtml = `<table class="journal-table"><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
    tabletJournal.innerHTML = tableHtml;

    const lessonDates = tabletJournal.querySelectorAll(".lesson-date");
    lessonDates.forEach(dateSpan => {
        dateSpan.addEventListener("click", () => {
            const topic = dateSpan.dataset.topic;
            alert(`Тема уроку: ${topic}`);
        });
    });
};
