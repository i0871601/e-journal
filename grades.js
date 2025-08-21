// Код виконується відразу після завантаження скрипта
document.getElementById('Grade').style.display = 'block';
console.log('Блок оцінок активний');

const studentLastName = sessionStorage.getItem('lastName');
const studentFirstName = sessionStorage.getItem('firstName');
const studentClass = sessionStorage.getItem('classOrsubject');

const grade = document.getElementById('Grade');
const selectElement = document.getElementById('subject');
const gradesContent = document.getElementById('grades-content');

let allGradesBySubject = {};

const displayErrorMessage = (message) => {
    gradesContent.innerHTML = `<p>${message}</p>`;
};

const displayGrades = (gradesData, subject) => {
    gradesContent.innerHTML = '';

    if (gradesData.length === 0) {
        displayErrorMessage('Оцінок з цього предмету ще немає.');
        return;
    }

    const lessons = [...new Map(gradesData.map(item => [item.lessonNumber, item])).values()];
    lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);

    let headerHtml = '<tr><th class="empty-header"></th>';
    lessons.forEach(lesson => {
        let headerText = '';
        // Визначаємо текст заголовка на основі lessonType
        if (lesson.lessonType === 'Thematic') {
            headerText = 'Тема';
        } else if (lesson.lessonType === 'Semester') {
            headerText = 'Сем';
        } else if (lesson.lessonType === 'Final') {
            headerText = 'Річн';
        } else {
            headerText = `Урок ${lesson.lessonNumber}`; 
        }

        headerHtml += `<th class="lesson-header">${headerText}<br><span class="lesson-date" data-topic="${lesson.Topic}">${lesson.Date}</span></th>`;
    });
    headerHtml += '</tr>';

    let bodyHtml = `<tr>
        <td class="info-cell">
            <h4 class="subject-title">Предмет: ${subject}</h4>
            <p class="student-name">${studentLastName} ${studentFirstName}</p>
        </td>`;
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
    gradesContent.innerHTML = tableHtml;

    const lessonDates = gradesContent.querySelectorAll('.lesson-date');
    lessonDates.forEach(dateSpan => {
        dateSpan.addEventListener('click', () => {
            const topic = dateSpan.dataset.topic;
            alert(`Тема уроку: ${topic}`);
        });
    });
};

const loadGradesForSubject = (subject) => {
    const gradesData = allGradesBySubject[subject] || [];
    displayGrades(gradesData, subject);
};

const displaySubjectsAsDropdown = (subjects) => {
    selectElement.innerHTML = '';
    
    if (subjects.length === 0) {
        const noSubjectsOption = document.createElement('option');
        noSubjectsOption.value = '';
        noSubjectsOption.textContent = 'Предметів немає';
        noSubjectsOption.disabled = true;
        noSubjectsOption.selected = true;
        selectElement.appendChild(noSubjectsOption);
        displayErrorMessage('Предметів ще немає. Попробуйте заново зайти.');
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Оберіть предмет';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);

        subjects.forEach(subject => {
            const optionElement = document.createElement('option');
            optionElement.value = subject;
            optionElement.textContent = subject;
            selectElement.appendChild(optionElement);
        });
    }
};

const loadAllStudentData = async () => {
    if (!studentLastName || !studentFirstName || !studentClass) {
        console.error('Відсутні дані учня в sessionStorage.');
        displaySubjectsAsDropdown([]);
        return;
    }

    try {
        const gradesUrl = `https://worker-student-full-journal.i0871601.workers.dev/?studentLastName=${studentLastName}&studentFirstName=${studentFirstName}&class=${studentClass}`;
        const gradesRes = await fetch(gradesUrl);
        if (!gradesRes.ok) {
            throw new Error(`Помилка завантаження оцінок: ${gradesRes.status}`);
        }
        const data = await gradesRes.json();
        
        allGradesBySubject = data.gradesBySubject;
        
        const subjects = data.subjects.sort();
        displaySubjectsAsDropdown(subjects);

    } catch (err) {
        console.error('Помилка завантаження даних:', err);
        displayErrorMessage('Сталася помилка. Спробуйте перезавантажити сторінку.');
    }
};

selectElement.addEventListener('change', (event) => {
    const selectedSubject = event.target.value;
    if (selectedSubject) {
        loadGradesForSubject(selectedSubject);
    }
});

loadAllStudentData();