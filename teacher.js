// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const contentContainer = document.getElementById('GradeOfJournal');
let allTeacherSubjectsAndClasses = [];
let currentStudents = [];
let journalCache = {};
const lastName = sessionStorage.getItem('lastName');
const firstName = sessionStorage.getItem('firstName');
const classOrSubject = sessionStorage.getItem('classOrsubject');

// Оголошення змінних для кнопок та списків
const subjectDropdownButton = document.getElementById('subject-button');
const classDropdownButton = document.getElementById('class-button');
const subjectList = document.getElementById('Subject');
const classList = document.getElementById('Class');
const subjectDiv = document.getElementById('subjectTeacher');
const classDiv = document.getElementById('classOfjournal');

// Обробники подій для відкриття меню
if (subjectDropdownButton) {
    subjectDropdownButton.addEventListener('click', () => {
        subjectList.classList.toggle('visible');
        classList.classList.remove('visible');
    });
}
if (classDropdownButton) {
    classDropdownButton.addEventListener('click', () => {
        classList.classList.toggle('visible');
        subjectList.classList.remove('visible');
    });
}

// Обробник для закриття меню при кліку поза його межами
document.addEventListener('click', (event) => {
    const isClickInsideSubjectMenu = subjectDiv.contains(event.target);
    const isClickInsideClassMenu = classDiv.contains(event.target);
    if (!isClickInsideSubjectMenu) {
        subjectList.classList.remove('visible');
    }
    if (!isClickInsideClassMenu) {
        classList.classList.remove('visible');
    }
});

async function init() {
    if (!subjectList || !classList) {
        console.error('Елементи для списків предметів або класів не знайдено.');
        return;
    }
    try {
        const url = `https://worker-grades-of-journal.i0871601.workers.dev/?lastName=${lastName}&classOrSubject=${classOrSubject}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.type === 'teacher_subjects_and_classes') {
            allTeacherSubjectsAndClasses = data.data;

            if (allTeacherSubjectsAndClasses.length > 1) {
                subjectDiv.style.display = 'block';
                allTeacherSubjectsAndClasses.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.subject;
                    li.dataset.subject = item.subject;
                    subjectList.appendChild(li);
                });

                subjectList.addEventListener('click', (event) => {
                    if (event.target.tagName === 'LI') {
                        const selectedSubject = event.target.dataset.subject;
                        const selectedData = allTeacherSubjectsAndClasses.find(item => item.subject === selectedSubject);
                        populateClassList(selectedData.classes);
                        updateSelectedState(subjectList, event.target);
                        subjectList.classList.remove('visible');
                    }
                });

                populateClassList(allTeacherSubjectsAndClasses[0].classes);
            } else {
                subjectDiv.style.display = 'none';
                populateClassList(allTeacherSubjectsAndClasses[0].classes);
            }

            classList.addEventListener('click', (event) => {
                if (event.target.tagName === 'LI') {
                    const selectedClass = event.target.dataset.class;
                    loadFullJournal(selectedClass);
                    updateSelectedState(classList, event.target);
                    classList.classList.remove('visible');
                }
            });

            setupAddLessonForm();

        } else if (data.type === 'student_subjects') {
            console.error('Неправильний тип даних для вчителя.');
        }

    } catch (error) {
        console.error('Сталася помилка при завантаженні даних:', error);
    }
}

const updateOrAddGrade = async (gradeData) => {
    const url = `https://worker-update-grade.i0871601.workers.dev/`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gradeData)
        });
        if (res.ok) {
            console.log('Оцінку успішно збережено!');
            const currentClass = getSelectedClass();
            delete journalCache[currentClass];
        } else if (res.status === 403) {
            alert('Зміни можна вносити лише в останній урок.');
            loadFullJournal(getSelectedClass());
        } else {
            console.error('Помилка при збереженні оцінки.');
        }
    } catch (e) {
        console.error('Помилка запиту:', e);
    }
};

const displayFullJournal = (journalData) => {
    const container = document.querySelector('.TabletJournal');
    if (!container) return;
    container.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('journal-table');
    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Прізвище та Ім\'я';
    headerRow.appendChild(nameHeader);
    currentStudents = journalData;
    const lessonsMap = new Map();
    journalData.forEach(student => {
        student.grades.forEach(grade => {
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
    const maxLessonNumber = lessons.length > 0 ? Math.max(...lessons.map(l => l.lessonNumber)) : 0;
    lessons.forEach(lesson => {
        const lessonHeader = document.createElement('th');
        let headerText = '';
        if (lesson.lessonType === 'Thematic') headerText = 'Тема';
        else if (lesson.lessonType === 'Semester') headerText = 'Сем';
        else if (lesson.lessonType === 'Final') headerText = 'Річн';
        else headerText = `Урок ${lesson.lessonNumber}`;
        lessonHeader.innerHTML = `${headerText}<br><span class="lesson-date">${lesson.Date}</span>`;
        lessonHeader.dataset.topic = lesson.Topic;
        const dateSpan = lessonHeader.querySelector('.lesson-date');
        if (dateSpan) {
            dateSpan.style.cursor = 'pointer';
            dateSpan.addEventListener('click', () => {
                alert(`Тема уроку ${lesson.lessonNumber}: ${lesson.Topic}`);
            });
        }
        headerRow.appendChild(lessonHeader);
    });
    const tableBody = table.createTBody();
    journalData.forEach(student => {
        const studentRow = tableBody.insertRow();
        const studentNameCell = studentRow.insertCell();
        studentNameCell.textContent = `${student.lastName} ${student.firstName}`;
        lessons.forEach(lesson => {
            const gradeCell = studentRow.insertCell();
            const grade = student.grades.find(g => g.lessonNumber === lesson.lessonNumber);
            const gradeValue = grade ? grade.Grade : '';
            const gradeType = grade ? grade.lessonType : 'Normal';
            if (gradeType !== 'Normal' || lesson.lessonNumber !== maxLessonNumber) {
                const gradeSpan = document.createElement('span');
                gradeSpan.textContent = gradeValue;
                if (gradeType !== 'Normal') gradeSpan.classList.add('calculated-grade');
                gradeCell.appendChild(gradeSpan);
            } else {
                const gradeInput = document.createElement('input');
                gradeInput.type = 'text';
                gradeInput.value = gradeValue;
                gradeInput.dataset.studentFirstName = student.firstName;
                gradeInput.dataset.studentLastName = student.lastName;
                gradeInput.dataset.lessonNumber = lesson.lessonNumber;
                gradeInput.classList.add('grade-input-cell');
                gradeInput.addEventListener('change', () => {
                    const updatedGrade = gradeInput.value.trim();
                    const lessonNumber = gradeInput.dataset.lessonNumber;
                    const studentFirstName = gradeInput.dataset.studentFirstName;
                    const studentLastName = gradeInput.dataset.studentLastName;
                    const gradeData = {
                        lessonNumber: lessonNumber,
                        studentFirstName: studentFirstName,
                        studentLastName: studentLastName,
                        teacherLastName: lastName,
                        subject: getSelectedSubject(),
                        grade: updatedGrade,
                        lessonType: 'Normal'
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
    const container = document.querySelector('.TabletJournal');
    container.innerHTML = 'Завантаження журналу...';
    if (!className) return container.innerHTML = '';
    if (journalCache[className]) {
        console.log('Дані завантажено з кешу для класу:', className);
        displayFullJournal(journalCache[className]);
        return;
    }
    const teacherSubject = getSelectedSubject();
    const url = `https://worker-full-journal.i0871601.workers.dev/?class=${className}&teacherLastName=${lastName}&teacherSubject=${teacherSubject}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Помилка мережі: ${res.status}`);
            container.textContent = 'Не вдалося завантажити журнал. Спробуйте пізніше.';
            return;
        }
        const journal = await res.json();
        journalCache[className] = journal;
        displayFullJournal(journal);
    } catch (err) {
        console.error('Помилка запиту:', err);
        container.textContent = 'Не вдалося завантажити журнал. Спробуйте пізніше.';
    }
};

const addLesson = async (lessonData) => {
    const url = `https://worker-add-lesson.i0871601.workers.dev/`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });
        if (res.ok) {
            alert('Урок успішно додано!');
            const currentClass = getSelectedClass();
            delete journalCache[currentClass];
            await loadFullJournal(currentClass);
            return true;
        } else {
            alert('Помилка при додаванні уроку.');
            return false;
        }
    } catch (e) {
        console.error('Помилка запиту:', e);
        alert('Помилка при додаванні уроку.');
        return false;
    }
};

function setupAddLessonForm() {
    const selectElement = document.getElementById('classOfjournal');
    if (!selectElement) return;
    const addLessonFormHTML = `
        <div id="add-lesson-form">
            <h3>Додати новий урок</h3>
            <input type="number" id="lessonNumberInput" placeholder="Номер уроку" required>
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
    selectElement.after(document.createRange().createContextualFragment(addLessonFormHTML));
    const saveLessonButton = document.getElementById('saveLessonButton');
    if (saveLessonButton) {
        saveLessonButton.addEventListener('click', async () => {
            const lessonNumberInput = document.getElementById('lessonNumberInput');
            const lessonDateInput = document.getElementById('lessonDateInput');
            const lessonTopicInput = document.getElementById('lessonTopicInput');
            const lessonTypeInput = document.getElementById('lessonTypeInput');
            const selectedClass = getSelectedClass();
            const selectedSubject = getSelectedSubject();
            const lessonNumber = lessonNumberInput.value;
            const lessonDate = lessonDateInput.value;
            const lessonTopic = lessonTopicInput.value;
            const lessonType = lessonTypeInput.value;
            if (!lessonNumber || !lessonDate || !lessonTopic || !selectedClass || !lessonType) {
                alert('Будь ласка, заповніть всі поля.');
                return;
            }
            const gradesData = currentStudents.map(student => ({
                studentFirstName: student.firstName,
                studentLastName: student.lastName,
                grade: ''
            }));
            const lessonData = {
                lessonNumber, Date: lessonDate, Topic: lessonTopic,
                teacherLastName: lastName, teacherSubject: selectedSubject,
                class: selectedClass, lessonType, grades: gradesData
            };
            const success = await addLesson(lessonData);
            if (success) {
                lessonNumberInput.value = '';
                lessonDateInput.value = '';
                lessonTopicInput.value = '';
                lessonTypeInput.value = 'Normal';
            }
        });
    }
}

function updateSelectedState(ulElement, selectedLi) {
    Array.from(ulElement.children).forEach(li => {
        li.classList.remove('selected');
    });
    selectedLi.classList.add('selected');
}

function getSelectedSubject() {
    const selectedItem = document.querySelector('#Subject li.selected');
    return selectedItem ? selectedItem.dataset.subject : null;
}

function getSelectedClass() {
    const selectedItem = document.querySelector('#Class li.selected');
    return selectedItem ? selectedItem.dataset.class : null;
}

function populateClassList(classes) {
    classList.innerHTML = '';
    classes.forEach(cls => {
        const li = document.createElement('li');
        li.textContent = cls;
        li.dataset.class = cls;
        classList.appendChild(li);
    });
}

init();