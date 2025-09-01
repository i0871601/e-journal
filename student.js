// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const contentContainer = document.getElementById('GradeOfJournal');
let allStudentSubjects = [];
const lastName = sessionStorage.getItem('lastName');
const firstName = sessionStorage.getItem('firstName');
const studentClass = sessionStorage.getItem('classOrsubject');
const subjectList = document.getElementById('Subject');
const subjectDiv = document.getElementById('subjectTeacher');

async function init() {
    if (!subjectList) {
        console.error('Елемент для списку предметів не знайдено.');
        return;
    }
    try {
        const url = `https://worker-grades-of-journal.i0871601.workers.dev/?lastName=${lastName}&classOrSubject=${studentClass}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.type === 'student_subjects') {
            allStudentSubjects = data.data;
            if (allStudentSubjects.length > 0) {
                subjectDiv.style.display = 'block';
                allStudentSubjects.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.subject;
                    li.dataset.subject = item.subject;
                    subjectList.appendChild(li);
                });
                subjectList.addEventListener('click', (event) => {
                    if (event.target.tagName === 'LI') {
                        const selectedSubject = event.target.dataset.subject;
                        loadStudentJournal(selectedSubject);
                        updateSelectedState(subjectList, event.target);
                    }
                });
            } else {
                subjectDiv.style.display = 'none';
            }
        } else if (data.type === 'teacher_subjects_and_classes') {
            console.error('Неправильний тип даних для учня.');
        }
    } catch (error) {
        console.error('Сталася помилка при завантаженні даних:', error);
    }
}

const loadStudentJournal = async (subject) => {
    const container = document.querySelector('.TabletJournal');
    container.innerHTML = 'Завантаження журналу...';
    if (!subject) return container.innerHTML = '';
    const url = `https://worker-full-journal.i0871601.workers.dev/?class=${studentClass}&studentLastName=${lastName}&studentSubject=${subject}`;
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
    const lessonsMap = new Map();
    journalData.grades.forEach(grade => {
        if (!lessonsMap.has(grade.lessonNumber)) {
            lessonsMap.set(grade.lessonNumber, {
                lessonNumber: grade.lessonNumber,
                Date: grade.Date,
                Topic: grade.Topic,
                lessonType: grade.lessonType
            });
        }
    });
    const lessons = Array.from(lessonsMap.values()).sort((a, b) => a.lessonNumber - b.lessonNumber);
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
    const studentRow = tableBody.insertRow();
    const studentNameCell = studentRow.insertCell();
    studentNameCell.textContent = `${journalData.lastName} ${journalData.firstName}`;
    lessons.forEach(lesson => {
        const gradeCell = studentRow.insertCell();
        const grade = journalData.grades.find(g => g.lessonNumber === lesson.lessonNumber);
        const gradeValue = grade ? grade.Grade : '';
        const gradeType = grade ? grade.lessonType : 'Normal';
        const gradeSpan = document.createElement('span');
        gradeSpan.textContent = gradeValue;
        if (gradeType !== 'Normal') gradeSpan.classList.add('calculated-grade');
        gradeCell.appendChild(gradeSpan);
    });
    container.appendChild(table);
};

function updateSelectedState(ulElement, selectedLi) {
    Array.from(ulElement.children).forEach(li => {
        li.classList.remove('selected');
    });
    selectedLi.classList.add('selected');
}

init();