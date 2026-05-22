const divJournal = document.getElementById('contentJournal');
const checkedContentJournal = document.getElementById('off-ContentJournal-on');

function renderTable(mapLessons, mapStudents, mapRecords, role) {
    if (checkedContentJournal.checked) {
        divJournal.innerHTML = '';
        checkedContentJournal.checked = false;
    }
    
    const thead = divJournal.createTHead();
    const headerRow = thead.insertRow();

    const studentHeader = document.createElement('th');
    studentHeader.textContent = "Прізвище";
    headerRow.appendChild(studentHeader);

    mapLessons.forEach((lesson, index) => {
        const th = document.createElement('th');

        const shortDate = lesson.Date ? lesson.Date.slice(0, 5) : '??.??';
        th.textContent = shortDate;

        //th.textContent = `${lesson.lessonNumber}`;
        /*if (lesson.Date && lesson.Date.length >= 5) {
            const day = lesson.Date.slice(0, 2);   // Витягуємо "21"
            const month = lesson.Date.slice(3, 5); // Витягуємо "05"
            
            // Використовуємо innerHTML, щоб браузер зчитав тег <br> як перенос
            th.innerHTML = `${day}<br><small>${month}</small>`;
        } else {
            th.innerHTML = '??<br>??';
        }*/
        th.dataset.lessonIndex = index;
        headerRow.appendChild(th);
    });

    const tbody = divJournal.createTBody();
  
    mapStudents.forEach(student => {
        const row = tbody.insertRow();
        
        const nameCell = row.insertCell();
        nameCell.textContent = `${student.lastName}`;
        
        mapLessons.forEach(lesson => {
            const scoreCell = row.insertCell();
            
            const studentGrades = mapRecords[student.lastName];
            const score = studentGrades ? studentGrades[lesson.lessonNumber] : '';
            
            scoreCell.textContent = score !== undefined ? score : ''; 

            if (role === 'teacher') {
                scoreCell.contentEditable = true;
                scoreCell.dataset.student = student.lastName;
                scoreCell.dataset.lesson = lesson.lessonNumber;
            } else {
                scoreCell.contentEditable = false;
            }
        });
    });

    console.log(mapLessons);
    console.log(mapStudents);
    console.log(mapRecords);
    checkedContentJournal.checked = true;
};

export function renderLog(role, subject, classes, teacherLastName, map) {
    const mapRecords = {};
    
    if(map.students.length === 0 || (role === 'student' && map.lessons.length === 0)) { 
        console.log("Не має учнів/уроків"); 
        divJournal.innerHTML = '';
        checkedContentJournal.checked = false;
        return
    }

    map.grades.forEach(el => {
        if(!mapRecords[el.lastName]) mapRecords[el.lastName] = {};
        mapRecords[el.lastName][el.lessonNumber] = el.rating
    });
    renderTable(map.lessons, map.students, mapRecords, role);

    divJournal.addEventListener('click', function(event) {
        const target = event.target;
        if (target.dataset.lessonIndex !== undefined) {
            const index = Number(target.dataset.lessonIndex);
            const lessonInfo = mapLessons[index];
            console.log(lessonInfo);
        }
    });

    if (role === 'teacher') {
        divJournal.addEventListener('focus', function(event) {
            const cell = event.target;
            if (cell.dataset.student && cell.dataset.lesson) cell._oldValue = cell.textContent.trim();
        }, true);

        divJournal.addEventListener('blur', function(event) {
            const cell = event.target;
            
            if (cell.dataset.student && cell.dataset.lesson) {
                const oldValue = cell._oldValue;
                const newScore = cell.textContent.trim();
                
                if (oldValue === newScore) return; 
                const student = cell.dataset.student;
                const lesson = cell.dataset.lesson;
            }
        }, true);
}
};