// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const role = sessionStorage.getItem("role");
const contentContainer = document.getElementById("GradeOfJournal");
const lastName = sessionStorage.getItem("lastName");
const firstName = sessionStorage.getItem("firstName");
let classOrSubject = sessionStorage.getItem("classOrsubject");

const subjectTeacherContainer = document.getElementById("subjectTeacher");
const subjectButton = document.getElementById("subject-button");
const subjectText = document.querySelector("#subject-button p");
const subjectList = document.getElementById("Subject");

let isInitialized = false;
let isFormCreated = false;
// Змінні та функції, специфічні для ролі
let currentStudents = [];
const dataCache = {};


if (subjectButton && subjectList) {
    subjectButton.addEventListener('click', () => {
        // Показуємо список предметів при кліку на кнопку
        subjectList.style.display = "block";
    });
}

// Слухач подій для батьківського елемента (<ul>)
subjectList.addEventListener('click', (event) => {
    // Перевіряємо, чи клік був саме на елементі <li>
    if (event.target.tagName === 'LI') {
        // Оновлюємо змінну з вмістом натиснутого елемента
        classOrSubject = event.target.textContent;
        subjectText.textContent = classOrSubject;

        console.log("Нове значення вибраного предмета:", classOrSubject);

        // Запускаємо тільки функцію для оновлення списку
        loadDropdownOptions();
        
        // Ховаємо список після вибору предмета
        subjectList.style.display = "none";
    }
});
// ЛОГІКА ДЛЯ ВЧИТЕЛЯ
const updateOrAddGrade = async (gradeData) => {
    const url = `https://worker-update-grade.i0871601.workers.dev/`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gradeData)
        });
        if (res.ok) {
            console.log("Оцінку успішно збережено!");
        } else if (res.status === 403) {
            alert("Зміни можна вносити лише в останній урок.");
            const selectedClass = document.querySelector("#classOfjournal .first-option p").textContent;
            loadFullJournal(selectedClass);
        } else {
            console.error("Помилка при збереженні оцінки.");
        }
    } catch (e) {
        console.error("Помилка запиту:", e);
    }
};

const displayFullJournal = (journalData) => {
    const container = document.querySelector(".TabletJournal");
    if (!container) return;
    container.innerHTML = "";
    const table = document.createElement("table");
    table.classList.add("journal-table");
    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    const nameHeader = document.createElement("th");
    nameHeader.textContent = "Прізвище та Ім'я";
    headerRow.appendChild(nameHeader);
    currentStudents = journalData;
    const lessonsMap = new Map();
    journalData.forEach((student) => {
        student.grades.forEach((grade) => {
            if (!lessonsMap.has(grade.lessonNumber)) {
                lessonsMap.set(grade.lessonNumber, {
                    lessonNumber: grade.lessonNumber,
                    Date: grade.Date,
                    Topic: grade.Topic,
                    lessonType: grade.lessonType
                });
            }
        });
    });

    const lessons = Array.from(lessonsMap.values()).sort((a, b) => a.lessonNumber - b.lessonNumber);
    const maxLessonNumber = lessons.length > 0 ? Math.max(...lessons.map((l) => l.lessonNumber)) : 0;

    lessons.forEach((lesson) => {
        const lessonHeader = document.createElement("th");
        let headerText = "";
        if (lesson.lessonType === "Thematic") headerText = "Тема";
        else if (lesson.lessonType === "Semester") headerText = "Сем";
        else if (lesson.lessonType === "Final") headerText = "Річн";
        else headerText = `Урок ${lesson.lessonNumber}`;
        lessonHeader.innerHTML = `${headerText}<br><span class="lesson-date">${lesson.Date}</span>`;
        lessonHeader.dataset.topic = lesson.Topic;
        const dateSpan = lessonHeader.querySelector(".lesson-date");
        if (dateSpan) {
            dateSpan.style.cursor = "pointer";
            dateSpan.addEventListener("click", () => {
                alert(`Тема уроку ${lesson.lessonNumber}: ${lesson.Topic}`);
            });
        }
        headerRow.appendChild(lessonHeader);
    });
    const tableBody = table.createTBody();

    journalData.forEach((student) => {
        const studentRow = tableBody.insertRow();
        const studentNameCell = studentRow.insertCell();
        studentNameCell.textContent = `${student.lastName} ${student.firstName}`;

        lessons.forEach((lesson) => {
            const gradeCell = studentRow.insertCell();
            const grade = student.grades.find((g) => g.lessonNumber === lesson.lessonNumber);
            const gradeValue = grade ? grade.Grade : "";

            const gradeType = grade ? grade.lessonType : "Normal";

            if (gradeType !== "Normal" || lesson.lessonNumber !== maxLessonNumber) {
                const gradeSpan = document.createElement("span");
                gradeSpan.textContent = gradeValue;
                if (gradeType !== "Normal") gradeSpan.classList.add("calculated-grade");
                gradeCell.appendChild(gradeSpan);
            } else {
                const gradeInput = document.createElement("input");
                gradeInput.type = "text";
                gradeInput.value = gradeValue;
                gradeInput.dataset.studentFirstName = student.firstName;
                gradeInput.dataset.studentLastName = student.lastName;
                gradeInput.dataset.lessonNumber = lesson.lessonNumber;
                gradeInput.classList.add("grade-input-cell");
                gradeInput.addEventListener("change", () => {
                    const updatedGrade = gradeInput.value.trim();
                    const lessonNumber = gradeInput.dataset.lessonNumber;
                    const studentFirstName = gradeInput.dataset.studentFirstName;
                    const studentLastName = gradeInput.dataset.studentLastName;
                    const gradeData = {
                        lessonNumber: lessonNumber,
                        studentFirstName: studentFirstName,
                        studentLastName: studentLastName,
                        teacherLastName: lastName,
                        subject: classOrSubject,
                        grade: updatedGrade,
                        lessonType: "Normal"
                    };
                    updateOrAddGrade(gradeData);
                });
                gradeCell.appendChild(gradeInput);
            }
        });
    });
    container.appendChild(table);
};

const loadFullJournal = async (className) => {
    const container = document.querySelector(".TabletJournal");
    const cacheKey = `teacher-${classOrSubject}-${className}`;
    container.innerHTML = "Завантаження журналу...";
    if (!className) return (container.innerHTML = "");
    
    if (dataCache[cacheKey]) {
        console.log("Дані завантажено з кешу для вчителя.");
        displayFullJournal(dataCache[cacheKey]);
        return;
    }
    const url = `https://worker-full-journal.i0871601.workers.dev/?class=${className}&teacherLastName=${lastName}&teacherSubject=${classOrSubject}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Помилка мережі: ${res.status}`);
            container.textContent = "Не вдалося завантажити журнал. Спробуйте пізніше.";
            return;
        }
        const journal = await res.json();
        dataCache[cacheKey] = journal;
        displayFullJournal(journal);
    } catch (err) {
        console.error("Помилка запиту:", err);
        container.textContent = "Не вдалося завантажити журнал. Спробуйте пізніше.";
    }
};

const addLesson = async (lessonData, selectedClass) => {
    const url = `https://worker-add-lesson.i0871601.workers.dev/`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lessonData)
        });
        if (res.ok) {
            alert("Урок успішно додано!");
            const cacheKey = `teacher-${classOrSubject}-${selectedClass}`;
            delete dataCache[cacheKey];
            loadFullJournal(selectedClass);
            return true;
        } else {
            alert("Помилка при додаванні уроку.");
            return false;
        }
    } catch (e) {
        console.error("Помилка запиту:", e);
        alert("Помилка при додаванні уроку.");
        return false;
    }
};

function setupAddLessonForm() {
    const container = document.getElementById("classOfjournal");
    if (isFormCreated) {
        return; 
    }
    if (!container) return;
    const addLessonFormHTML = `
        <div id="add-lesson-form">
            <h3>Додати новий урок</h3>
            <input type="text" id="lessonNumberInput" placeholder="Номер уроку" required>
            <input type="text" id="lessonDateInput" placeholder="Дата (дд.мм.рррр)" required>
            <input type="text" id="lessonTopicInput" placeholder="Тема уроку" required>
            <label for="lessonTypeInput">Тип уроку:</label>
            <select id="lessonTypeInput" required>
                <option value="Normal">Звичайний</option>
                <option value="Thematic">Тематична</option>
                <option value="Semester">Семестрова</option>
                <option value="Final">Річна</option>
            </select>
            <button id="saveLessonButton">Зберегти урок</button>
        </div>
    `;
    
    container.insertAdjacentHTML('afterend', addLessonFormHTML);
    const saveLessonButton = document.getElementById("saveLessonButton");
    if (saveLessonButton) {
        saveLessonButton.addEventListener("click", async () => {
            const lessonNumberInput = document.getElementById("lessonNumberInput");
            const lessonDateInput = document.getElementById("lessonDateInput");
            const lessonTopicInput = document.getElementById("lessonTopicInput");
            const lessonTypeInput = document.getElementById("lessonTypeInput");
            const lessonNumber = lessonNumberInput.value;
            const lessonDate = lessonDateInput.value;
            const lessonTopic = lessonTopicInput.value;
            const lessonType = lessonTypeInput.value;
            const selectedClass = document.querySelector("#classOfjournal .first-option p").textContent;
            
            if (!lessonNumber || !lessonDate || !lessonTopic || !selectedClass || !lessonType) {
                alert("Будь ласка, заповніть всі поля.");
                return;
            }

            const gradesData = currentStudents.map((student) => ({
                studentFirstName: student.firstName,
                studentLastName: student.lastName,
                grade: ""
            }));

            const lessonData = {
                lessonNumber,
                Date: lessonDate,
                Topic: lessonTopic,
                teacherLastName: lastName,
                teacherSubject: classOrSubject,
                class: selectedClass,
                lessonType,
                grades: gradesData
            };

            const success = await addLesson(lessonData, selectedClass);
            if (success) {
                lessonNumberInput.value = "";
                lessonDateInput.value = "";
                lessonTopicInput.value = "";
                lessonTypeInput.value = "Normal";
            }
        });
    }
    isFormCreated = true;
}
// ЛОГІКА ДЛЯ УЧНЯ
function runStudentGradesLogic() {
    console.log("Запускається логіка для оцінок учня.");

    const displayErrorMessage = (message) => {
        const containerJournal = document.querySelector(".TabletJournal");
        if (containerJournal) containerJournal.innerHTML = `<p>${message}</p>`;
    };
    const displayGrades = (gradesData, subject) => {
        const containerJournal = document.querySelector(".TabletJournal");
        if (!containerJournal) return;
        containerJournal.innerHTML = "";
        if (gradesData.length === 0) {
            displayErrorMessage("Оцінок з цього предмету ще немає.");
            return;
        }
        const lessons = [...new Map(gradesData.map((item) => [item.lessonNumber, item])).values()];
        lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
        let headerHtml = '<tr><th class="empty-header"></th>';
        lessons.forEach((lesson) => {
            let headerText = "";
            if (lesson.lessonType === "Thematic") headerText = "Тема";
            else if (lesson.lessonType === "Semester") headerText = "Сем";
            else if (lesson.lessonType === "Final") headerText = "Річн";
            else headerText = `Урок ${lesson.lessonNumber}`;
            headerHtml += `<th class="lesson-header">${headerText}<br><span class="lesson-date" data-topic="${lesson.Topic}">${lesson.Date}</span></th>`;
        });
        headerHtml += "</tr>";
        let bodyHtml = `<tr><td class="info-cell"><h4 class="subject-title">Предмет: ${subject}</h4><p class="student-name">${lastName} ${firstName}</p></td>`;
        lessons.forEach((lesson) => {
            const grade = gradesData.find((g) => g.lessonNumber === lesson.lessonNumber);
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
        containerJournal.innerHTML = tableHtml;
        const lessonDates = containerJournal.querySelectorAll(".lesson-date");
        lessonDates.forEach((dateSpan) => {
            dateSpan.addEventListener("click", () => {
                const topic = dateSpan.dataset.topic;
                alert(`Тема уроку: ${topic}`);
            });
        });
    };

    const loadGradesForSubject = async (subject, teacherLastName) => {
        const containerJournal = document.querySelector(".TabletJournal");
        const cacheKey = `student-${subject}`;
        if (!containerJournal) return;
        containerJournal.innerHTML = "Завантаження оцінок...";

        if (dataCache[cacheKey]) {
            console.log("Дані завантажено з кешу для учня.");
            displayGrades(dataCache[cacheKey], subject);
            return;
        }
        try {
            const gradesUrl = `https://worker-student-full-journal.i0871601.workers.dev/?studentLastName=${lastName}&studentFirstName=${firstName}&class=${classOrSubject}&subject=${subject}&teacherLastName=${teacherLastName}`;
            const gradesRes = await fetch(gradesUrl);
            const gradesData = await gradesRes.json();
            dataCache[cacheKey] = gradesData.grades;
            displayGrades(gradesData.grades, subject);
        } catch (err) {
            console.error("Помилка завантаження даних:", err);
            displayErrorMessage("Сталася помилка. Спробуйте перезавантажити сторінку.");
        }
    };
    return { loadGradesForSubject };
}
// ЛОГІКА ОБРОБКИ ВИБОРУ З ВИПАДАЮЧОГО МЕНЮ
function handleDropdownSelection() {
    const listElement = document.querySelector("#classOfjournal #subjectClass");
    const buttonElement = document.querySelector("#classOfjournal .first-option");
    // Обробник для показу/приховування списку
    if (buttonElement && listElement) {
        buttonElement.addEventListener('click', () => {
            listElement.style.display = listElement.style.display === "block" ? "none" : "block";
        });
    }
    // Обробник для вибору елемента зі списку
    if (listElement) {
        listElement.addEventListener("click", async (event) => {
            if (event.target.tagName === 'LI') {
                const selectedValue = event.target.textContent;
                const teacherLastName = event.target.dataset.teacherLastName;
                
                // Оновлюємо текст на кнопці
                buttonElement.querySelector("p").textContent = selectedValue;
                listElement.style.display = "none";

                // Запускаємо логіку завантаження
                if (role === "teacher") {
                    loadFullJournal(selectedValue);
                } else if (role === "student") {
                    if (selectedValue) {
                        const studentLogic = runStudentGradesLogic(); // Потрібно отримати екземпляр
                        studentLogic.loadGradesForSubject(selectedValue, teacherLastName);
                    }
                }
            }
        });
    }
}
// Винесено логіку отримання та заповнення списку в окрему функцію
async function loadDropdownOptions() {
    const listElement = document.querySelector("#classOfjournal #subjectClass");
    if (!listElement) {
        console.error("Елемент для випадаючого списку не знайдено.");
        return;
    }
    
    try {
        const url = `https://worker-grades-of-journal.i0871601.workers.dev/?lastName=${lastName}&classOrSubject=${classOrSubject}`;
        const response = await fetch(url);
        const data = await response.json();
        
        listElement.innerHTML = "";
        
        if (role === "teacher") {
            
        } else if (role === "student") {
            
        }

        if (data.type === "classes") {
            data.data.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
            data.data.forEach((item) => {
                const listItem = document.createElement("li");
                listItem.textContent = item;
                listElement.appendChild(listItem);
            });
        } else if (data.type === "subjects") {
            data.data.sort((a, b) =>
                a.subject.localeCompare(b.subject, undefined, { numeric: true, sensitivity: "base" })
            );
            data.data.forEach((item) => {
                const listItem = document.createElement("li");
                listItem.textContent = item.subject;
                listItem.dataset.teacherLastName = item.teacherLastName || "";
                listElement.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Сталася помилка при завантаженні даних:", error);
        listElement.innerHTML = "<li>Помилка завантаження</li>";
    }
}
// УНІВЕРСАЛЬНА ФУНКЦІЯ ЗАПУСКУ
async function init() {
    if (!isInitialized) {
        if (classOrSubject){
            if(classOrSubject.includes(',')){
                const subjectsArray = classOrSubject.split(',').map(item => item.trim());
                subjectList.innerHTML = '';
                subjectsArray.forEach(subject => {
                    const listItem = document.createElement('li');
                    listItem.textContent = subject;
                    subjectList.appendChild(listItem);
                });
                if (subjectsArray.length > 0) {
                    classOrSubject = subjectsArray[0];
                    subjectText.textContent = classOrSubject;
                }
                subjectTeacherContainer.style.display = "block";
            } else {
                classOrSubject = classOrSubject.trim();
            }
        }
        isInitialized = true;
    }
    
    console.log("Поточне значення classOrSubject:", classOrSubject);
    
    handleDropdownSelection();
    // Додаємо обробники подій тільки один раз при запуску
    if (role === "teacher") {
        setupAddLessonForm();
    }
    
    // Викликаємо нову функцію для завантаження даних
    await loadDropdownOptions();
}

init();