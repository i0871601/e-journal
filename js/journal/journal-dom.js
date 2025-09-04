//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const contentContainer = document.getElementById("GradeOfJournal");
const tabletJournal = document.querySelector(".TabletJournal");
const classDropdownButton = document.querySelector("#ClassTeacher .first-option");
const classDropdownList = document.getElementById("class-list");
const subjectDropdownButton = document.querySelector("#subject-button");
const subjectDropdownList = document.getElementById("subject-list");
const subjectContainer = document.getElementById("Select-Subject");

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

            if (isEditable) {
                const gradeInput = document.createElement("input");
                gradeInput.type = "text";
                gradeInput.value = gradeValue;
                gradeInput.dataset.lessonNumber = lesson.lessonNumber;
                gradeInput.dataset.studentFirstName = student.firstName;
                gradeInput.dataset.studentLastName = student.lastName;
                gradeInput.classList.add("grade-input-cell");
                
                gradeInput.addEventListener("change", (e) => {
                    updateGradeCallback(e.target.dataset, e.target.value);
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

export const setupMainDropdown = (role, firstOptionText, onSelectionCallback) => {
    const listElement = role === 'teacher' ? classDropdownList : subjectDropdownList;
    const buttonElement = role === 'teacher' ? classDropdownButton : subjectDropdownButton;

    if (buttonElement && buttonElement.querySelector("p")) {
        buttonElement.querySelector("p").textContent = firstOptionText;
    }

    if (listElement) {
        listElement.addEventListener("click", (event) => {
            if (event.target.tagName === 'LI') {
                const selectedValue = event.target.textContent;
                const teacherLastName = event.target.dataset.teacherLastName;
                
                if (buttonElement && buttonElement.querySelector("p")) {
                    buttonElement.querySelector("p").textContent = selectedValue;
                }
                listElement.style.display = "none";
                onSelectionCallback(selectedValue, teacherLastName);
            }
        });
    }
};

export const setupAddLessonForm = (onSaveCallback) => {
    if (document.getElementById("add-lesson-form")) {
        return;
    }

    if (!contentContainer) return;

    const addLessonFormHTML = `
        <div id="add-lesson-form">
            <h3>Додати новий урок</h3>
            <input type="text" id="lessonDateInput" placeholder="Дата (дд.мм.рррр)" required>
            <input type="text" id="lessonTopicInput" placeholder="Тема уроку" required>
            <div id="lessonTypeInput" class="container-all">
                <div id="lessonType-Button" class="dropdown-button">
                    <p>Виберіть тип уроку</p>
                    <div class="arrow-down"></div>
                </div>
                <ul id="lessonTypeList" class="dropdown-list">
                    <li data-type="Normal">Звичайний</li>
                    <li data-type="Thematic">Тематична</li>
                    <li data-type="Semester">Семестрова</li>
                    <li data-type="Final">Річна</li>
                </ul>
            </div>
            <button id="saveLessonButton">Зберегти урок</button>
        </div>
    `;
    contentContainer.insertAdjacentHTML('afterend', addLessonFormHTML);

    const lessonTypePara = document.getElementById("lessonType-Button").querySelector("p");
    const lessonTypeList = document.getElementById("lessonTypeList");
    const saveLessonButton = document.getElementById("saveLessonButton");

    lessonTypeList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const allListItems = lessonTypeList.querySelectorAll('li');
            allListItems.forEach(item => item.classList.remove('selected'));
            event.target.classList.add('selected');
            const selectedType = event.target.textContent;
            lessonTypePara.textContent = selectedType;
            lessonTypeList.style.display = "none";
        }
    });

    if (saveLessonButton) {
        saveLessonButton.addEventListener("click", () => {
            const lessonDateInput = document.getElementById("lessonDateInput");
            const lessonTopicInput = document.getElementById("lessonTopicInput");
            const selectedListItem = document.querySelector('#lessonTypeList li.selected');
            
            if (!lessonDateInput.value || !lessonTopicInput.value || !selectedListItem) {
                alert("Будь ласка, заповніть всі поля.");
                return;
            }

            const lessonType = selectedListItem.dataset.type;
            onSaveCallback({
                Date: lessonDateInput.value,
                Topic: lessonTopicInput.value,
                lessonType: lessonType
            });
            
            lessonDateInput.value = "";
            lessonTopicInput.value = "";
            lessonTypePara.textContent = "Виберіть тип уроку";
            const selected = document.querySelector('#lessonTypeList li.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
        });
    }
};

export const populateDropdown = (listElement, data) => {
    if (!listElement) return;
    listElement.innerHTML = "";
    
    if (data.type === "classes") {
        data.data.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
        data.data.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            listElement.appendChild(listItem);
        });
    } else if (data.type === "subjects") {
        data.data.sort((a, b) => a.subject.localeCompare(b.subject, undefined, { numeric: true, sensitivity: "base" }));
        data.data.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item.subject;
            listItem.dataset.teacherLastName = item.teacherLastName || "";
            listElement.appendChild(listItem);
        });
    }
};

export const showJournalMessage = (message) => {
    if (tabletJournal) {
        tabletJournal.innerHTML = `<p>${message}</p>`;
    }
};

export const toggleSubjectTeacherDropdown = (isVisible) => {
    if (subjectContainer) {
        subjectContainer.style.display = isVisible ? "block" : "none";
    }
};

export const setSubjectTeacherButtonText = (text) => {
    if (subjectDropdownButton && subjectDropdownButton.querySelector("p")) {
        subjectDropdownButton.querySelector("p").textContent = text;
    }
};

export const setupGlobalDropdownClose = () => {
    document.addEventListener('click', (event) => {
        const allDropdowns = document.querySelectorAll('.dropdown-list');
        allDropdowns.forEach(list => {
            const parentContainer = list.closest('.container-all');
            if (parentContainer) {
                const isClickInsideButton = parentContainer.querySelector('.first-option, .dropdown-button').contains(event.target);
                const isClickInsideList = list.contains(event.target);
                
                if (isClickInsideButton) {
                    list.style.display = list.style.display === "block" ? "none" : "block";
                } else if (list.style.display === "block" && !isClickInsideList) {
                    list.style.display = "none";
                }
            }
        });
    });

};

