// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const contentContainer = document.getElementById('GradeOfJournal');
let allStudentSubjects = [];
const lastName = sessionStorage.getItem('lastName');
const firstName = sessionStorage.getItem('firstName');
const classOrSubject = sessionStorage.getItem('classOrsubject');
let allTeacherSubjectsAndClasses = [];
let currentStudents = [];
let journalCache = {};

// Оголошення змінних для кнопок та списків
const subjectDropdownButton = document.getElementById('subject-button');
const subjectList = document.getElementById('Subject');
const subjectDiv = document.getElementById('subjectTeacher');
const tabletJournalContainer = document.querySelector('.TabletJournal');
let selectedClass = null;

if (subjectDropdownButton) {
    subjectDropdownButton.addEventListener('click', () => {
        subjectList.classList.toggle('visible');
    });
}

document.addEventListener('click', (event) => {
    const isClickInsideSubjectMenu = subjectDiv.contains(event.target);
    if (!isClickInsideSubjectMenu) {
        subjectList.classList.remove('visible');
    }
});

async function init() {
    if (!subjectList || !tabletJournalContainer) {
        console.error('Елементи для списків предметів або контейнер журналу не знайдено.');
        return;
    }
    try {
        const url = `https://worker-grades-of-journal.i0871601.workers.dev/?lastName=${lastName}&classOrSubject=${classOrSubject}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.type === 'student_subjects') {
            allStudentSubjects = data.data;

            allStudentSubjects.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.subject;
                li.dataset.subject = item.subject;
                subjectList.appendChild(li);
            });

            subjectList.addEventListener('click', (event) => {
                if (event.target.tagName === 'LI') {
                    const selectedSubject = event.target.dataset.subject;
                    const teacherLastName = data.teacherLastName;
                    loadStudentJournal(selectedSubject, teacherLastName);
                    updateSelectedState(subjectList, event.target);
                    subjectList.classList.remove('visible');
                }
            });

        } else if (data.type === 'teacher_subjects_and_classes') {
            console.error('Неправильний тип даних для учня.');
        }

    } catch (error) {
        console.error('Сталася помилка при завантаженні даних:', error);
    }
}

const displayFullJournal = (journalData) => {
    const container = document.querySelector('.TabletJournal');
    if (!container) return;
    container.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('journal-table');
    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    
    // Перевіряємо, чи є дані для відображення
    if (!journalData || journalData.length === 0) {
        container.textContent = 'Журнал порожній.';
        return;
    }

    const lessonsMap = new Map();
    journalData.forEach(grade => {
        if (!lessonsMap.has(grade.lessonNumber)) {
            lessonsMap.set(grade.lessonNumber, {
                lessonNumber: grade.lessonNumber,
                Date: grade.Date,
                Topic: grade.Topic,
                lessonType: grade.lessonType,
                Grade: grade.Grade // Додано для коректного відображення
            });
        }
    });

    const lessons = Array.from(lessonsMap.values()).sort((a, b) => a.lessonNumber - b.lessonNumber);

    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Урок';
    headerRow.appendChild(nameHeader);
    const gradeHeader = document.createElement('th');
    gradeHeader.textContent = 'Оцінка';
    headerRow.appendChild(gradeHeader);

    const tableBody = table.createTBody();
    lessons.forEach(lesson => {
        const row = tableBody.insertRow();
        const lessonCell = row.insertCell();
        lessonCell.textContent = `Урок ${lesson.lessonNumber} (${lesson.Date})`;

        const gradeCell = row.insertCell();
        const grade = journalData.find(g => g.lessonNumber === lesson.lessonNumber);
        const gradeValue = grade ? grade.Grade : '';
        const gradeType = grade ? grade.lessonType : 'Normal';
        const gradeSpan = document.createElement('span');
        gradeSpan.textContent = gradeValue;
        if (gradeType !== 'Normal') gradeSpan.classList.add('calculated-grade');
        gradeCell.appendChild(gradeSpan);
    });

    container.appendChild(table);
};

const loadStudentJournal = async (subject, teacherLastName) => {
    const container = document.querySelector('.TabletJournal');
    container.innerHTML = 'Завантаження журналу...';

    const studentLastName = sessionStorage.getItem('lastName');
    const studentFirstName = sessionStorage.getItem('firstName');
    const studentClass = sessionStorage.getItem('classOrSubject');
    console.log(studentLastName);
    console.log(studentFirstName);
    console.log(studentClass);
    console.log(subject);
    console.log(teacherLastName);

    if (!subject || !studentLastName || !studentFirstName || !studentClass || !teacherLastName) {
        container.textContent = 'Необхідні дані для завантаження журналу відсутні.';
        return;
    }

    const url = `https://worker-student-full-journal.i0871601.workers.dev/?studentLastName=${studentLastName}&studentFirstName=${studentFirstName}&class=${studentClass}&subject=${subject}&teacherLastName=${teacherLastName}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Помилка мережі: ${res.status}`);
            container.textContent = 'Не вдалося завантажити журнал. Спробуйте пізніше.';
            return;
        }
        const journal = await res.json();
        displayFullJournal(journal);
    } catch (err) {
        console.error('Помилка запиту:', err);
        container.textContent = 'Не вдалося завантажити журнал. Спробуйте пізніше.';
    }
};

function updateSelectedState(ulElement, selectedLi) {
    Array.from(ulElement.children).forEach(li => {
        li.classList.remove('selected');
    });
    if (selectedLi) {
        selectedLi.classList.add('selected');
    }
}

init();