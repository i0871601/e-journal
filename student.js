// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const contentContainer = document.getElementById('GradeOfJournal');

const lastName = sessionStorage.getItem('lastName');
const firstName = sessionStorage.getItem('firstName');
const classOrSubject = sessionStorage.getItem('classOrsubject');

function runStudentGradesLogic() {
    const displayErrorMessage = (message) => {
        const containerJournal = document.querySelector('.TabletJournal');
        if (containerJournal) containerJournal.innerHTML = `<p>${message}</p>`;
    };

    const displayGrades = (gradesData, subject) => {
        const containerJournal = document.querySelector('.TabletJournal');
        if (!containerJournal) return;
        containerJournal.innerHTML = '';
        if (gradesData.length === 0) {
            displayErrorMessage('Оцінок з цього предмету ще немає.');
            return;
        }
        const lessons = [...new Map(gradesData.map(item => [item.lessonNumber, item])).values()];
        lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
        let headerHtml = '<tr><th class="empty-header"></th>';
        lessons.forEach(lesson => {
            let headerText = '';
            if (lesson.lessonType === 'Thematic') headerText = 'Тема';
            else if (lesson.lessonType === 'Semester') headerText = 'Сем';
            else if (lesson.lessonType === 'Final') headerText = 'Річн';
            else headerText = `Урок ${lesson.lessonNumber}`;
            headerHtml += `<th class="lesson-header">${headerText}<br><span class="lesson-date" data-topic="${lesson.Topic}">${lesson.Date}</span></th>`;
        });
        headerHtml += '</tr>';
        let bodyHtml = `<tr><td class="info-cell"><h4 class="subject-title">Предмет: ${subject}</h4><p class="student-name">${lastName} ${firstName}</p></td>`;
        lessons.forEach(lesson => {
            const grade = gradesData.find(g => g.lessonNumber === lesson.lessonNumber);
            const gradeValue = (grade && grade.Grade !== null && grade.Grade !== 'null') ? grade.Grade : '';
            const gradeType = grade ? grade.lessonType : null;
            let gradeHtml = gradeValue;
            if (gradeType !== 'Normal' && gradeType !== null) {
                gradeHtml = `<span class="calculated-grade">${gradeValue}</span>`;
            }
            bodyHtml += `<td class="grade-cell">${gradeHtml}</td>`;
        });
        bodyHtml += '</tr>';
        const tableHtml = `<table class="journal-table"><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
        containerJournal.innerHTML = tableHtml;
        const lessonDates = containerJournal.querySelectorAll('.lesson-date');
        lessonDates.forEach(dateSpan => {
            dateSpan.addEventListener('click', () => {
                const topic = dateSpan.dataset.topic;
                alert(`Тема уроку: ${topic}`);
            });
        });
    };

    const loadGradesForSubject = async (subject, teacherLastName) => {
        const containerJournal = document.querySelector('.TabletJournal');
        if (!containerJournal) return;
        containerJournal.innerHTML = 'Завантаження оцінок...';

        try {
            const gradesUrl = `https://worker-student-full-journal.i0871601.workers.dev/?studentLastName=${lastName}&studentFirstName=${firstName}&class=${classOrSubject}&subject=${subject}&teacherLastName=${teacherLastName}`;
            const gradesRes = await fetch(gradesUrl);
            const gradesData = await gradesRes.json();

            displayGrades(gradesData.grades, subject);
        } catch (err) {
            console.error('Помилка завантаження даних:', err);
            displayErrorMessage('Сталася помилка. Спробуйте перезавантажити сторінку.');
        }
    };

    return { loadGradesForSubject };
}

async function init() {
    const selectElement = document.getElementById('classOfjournal');
    if (!selectElement) {
        console.error('Елемент для випадаючого списку не знайдено.');
        return;
    }

    let studentLogic = runStudentGradesLogic();

    try {
        const url = `https://worker-grades-of-journal.i0871601.workers.dev/?lastName=${lastName}&classOrSubject=${classOrSubject}`;
        const response = await fetch(url);
        const data = await response.json();
        
        selectElement.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Оберіть предмет';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);

        data.data.sort((a, b) => a.subject.localeCompare(b.subject, undefined, { numeric: true, sensitivity: 'base' }));
        data.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.subject;
            option.textContent = item.subject;
            option.dataset.teacherLastName = item.teacherLastName || '';
            selectElement.appendChild(option);
        });
        
        selectElement.addEventListener('change', async (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            const selectedValue = selectedOption.value;
            const teacherLastName = selectedOption.dataset.teacherLastName;
            if (selectedValue) {
                studentLogic.loadGradesForSubject(selectedValue, teacherLastName);
            }
        });

    } catch (error) {
        console.error('Сталася помилка при завантаженні даних:', error);
        selectElement.innerHTML = '<option>Помилка завантаження</option>';
    }
}

init();